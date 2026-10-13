import { orderModel } from "./orderModel.js";
import { userModel } from '../user/userModel.js'
import { productModel } from '../product/productModel.js'
import Stripe from 'stripe'

const allowedTerms = [1, 3, 6, 12];
const deliveryFee = 40;
const stripeConfigurationMessage = "Online payment is not configured. Set a valid Stripe secret key on the backend and try again.";
const bookingStatusTransitions = {
    "Booked": ["Out for delivery", "Cancelled"],
    "Out for delivery": ["Active", "Cancelled"],
    "Active": ["Returned"],
    "Returned": [],
    "Cancelled": [],
};

const getStripeClient = () => {
    const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
    if (!secretKey || !/^(sk|rk)_(test|live)_/.test(secretKey)) return null;
    return new Stripe(secretKey);
};

export const placeOrder = async (req, res) => {
    try {
        const { items, address } = req.body;
        if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
            return res.status(400).json({ success: false, message: "Your rental basket is empty" });
        }
        if (items.some((item) => !item || typeof item !== "object")) {
            return res.status(400).json({ success: false, message: "A rental item is invalid" });
        }
        const productIds = items.map((item) => item.productId);
        if (productIds.some((id) => typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) || new Set(productIds).size !== productIds.length) {
            return res.status(400).json({ success: false, message: "A rental item is invalid" });
        }
        if (!address || !address.firstname || !address.lastname || !address.email || !address.street || !address.city || !address.state || !address.pinCode || !address.phone) {
            return res.status(400).json({ success: false, message: "Complete your delivery details before booking" });
        }
        const stripe = getStripeClient();
        if (!stripe) {
            return res.status(503).json({ success: false, message: stripeConfigurationMessage });
        }
        const products = await productModel.find({ _id: { $in: productIds } });
        if (products.length !== new Set(productIds).size) {
            return res.status(400).json({ success: false, message: "One or more rental items are no longer available" });
        }
        const productById = new Map(products.map((product) => [String(product._id), product]));
        const rentalItems = [];
        let rentalSubtotal = 0;
        let depositAmount = 0;
        for (const requestedItem of items) {
            const product = productById.get(requestedItem.productId);
            const quantity = Number(requestedItem.quantity);
            const months = Number(requestedItem.rentalMonths);
            if (!allowedTerms.includes(months)) {
                return res.status(400).json({ success: false, message: "Choose a valid rental term for every item" });
            }
            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
                return res.status(400).json({ success: false, message: "Rental quantity must be between 1 and 20" });
            }
            const monthlyRent = Math.round(Number(product.monthlyRent ?? Math.max(1, product.price * 0.05)));
            const securityDeposit = Math.max(0, Math.round(Number(product.securityDeposit ?? Math.max(0, product.price * 0.15))));
            if (!Number.isFinite(monthlyRent) || monthlyRent < 1 || !Number.isFinite(securityDeposit)) {
                return res.status(409).json({ success: false, message: `${product.name} has invalid rental pricing` });
            }
            const itemRent = monthlyRent * months * quantity;
            const itemDeposit = securityDeposit * quantity;
            rentalSubtotal += itemRent;
            depositAmount += itemDeposit;
            rentalItems.push({
                productId: String(product._id),
                name: product.name,
                image: product.image,
                quantity,
                monthlyRent,
                rentalMonths: months,
                rentalAmount: itemRent,
                securityDeposit: itemDeposit,
            });
        }
        const amount = rentalSubtotal + depositAmount + deliveryFee;
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: rentalItems,
            rentalMonths: new Set(rentalItems.map((item) => item.rentalMonths)).size === 1 ? rentalItems[0].rentalMonths : undefined,
            rentalSubtotal,
            depositAmount,
            amount,
            address,
        });
        const line_items = rentalItems.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: { name: `${item.name} rental (${item.rentalMonths} month${item.rentalMonths === 1 ? "" : "s"})` },
                unit_amount: Math.round(item.monthlyRent * item.rentalMonths * 100),
            },
            quantity: item.quantity,
        }));
        for (const item of rentalItems.filter((rentalItem) => rentalItem.securityDeposit > 0)) {
            line_items.push({
                price_data: {
                    currency: "inr",
                    product_data: { name: `${item.name} refundable security deposit` },
                    unit_amount: Math.round((item.securityDeposit / item.quantity) * 100),
                },
                quantity: item.quantity,
            });
        }
        line_items.push({
            price_data: {
                currency: "inr",
                product_data: { name: "One-time delivery and setup" },
                unit_amount: deliveryFee * 100,
            },
            quantity: 1,
        });

        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/verify?orderId=${newOrder._id}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/verify?cancelled=true&orderId=${newOrder._id}`,
            metadata: { orderId: String(newOrder._id), userId: String(req.body.userId) },
        });
        newOrder.stripeSessionId = session.id;
        await newOrder.save();
        return res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.error("Unable to place rental booking", error);
        if (error?.type === "StripeAuthenticationError" || error?.code === "api_key_invalid") {
            return res.status(503).json({ success: false, message: stripeConfigurationMessage });
        }
        return res.status(500).json({ success: false, message: "Unable to place rental booking. Please try again." });
    }
}

export const verifyOrder = async (req, res) => {
    const { orderId, session_id: sessionId } = { ...req.query, ...req.body };
    try {
        if (typeof orderId !== "string" || !/^[a-f\d]{24}$/i.test(orderId) || typeof sessionId !== "string") {
            return res.status(400).json({ success: false, message: "Missing payment verification details" });
        }
        const stripe = getStripeClient();
        if (!stripe) {
            return res.status(503).json({ success: false, message: stripeConfigurationMessage });
        }
        const order = await orderModel.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: "Rental booking not found" });
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.metadata?.orderId !== String(order._id) || session.id !== order.stripeSessionId) {
            return res.status(400).json({ success: false, message: "Payment session does not match this booking" });
        }
        if (session.payment_status !== "paid") {
            return res.status(402).json({ success: false, message: "Payment has not been completed" });
        }
        if (!order.payment) {
            order.payment = true;
            order.status = "Booked";
            await order.save();
        }
        if (!order.cartCleared) {
            const user = await userModel.findById(order.userId);
            if (user) {
                const cartData = { ...user.cartData };
                const rentalTerms = { ...user.rentalTerms };
                for (const item of order.items) {
                    const remainingQuantity = (cartData[item.productId] || 0) - item.quantity;
                    if (remainingQuantity > 0) {
                        cartData[item.productId] = remainingQuantity;
                    } else {
                        delete cartData[item.productId];
                        delete rentalTerms[item.productId];
                    }
                }
                await userModel.findByIdAndUpdate(order.userId, { cartData, rentalTerms });
            }
            order.cartCleared = true;
            await order.save();
        }
        return res.json({ success: true, message: "Rental booked" });
    } catch (error) {
        console.error("Failed to verify rental payment", error);
        if (error?.type === "StripeAuthenticationError" || error?.code === "api_key_invalid") {
            return res.status(503).json({ success: false, message: stripeConfigurationMessage });
        }
        return res.status(500).json({ success: false, message: "Unable to verify payment" });
    }
}

export const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId }).sort({ date: -1 })
        return res.json({ success: true, data: orders })
    } catch (error) {
        console.error("Failed to load user rental bookings", error);
        return res.status(500).json({ success: false, message: "Unable to load rental bookings" })
    }
}

export const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ date: -1 });
        return res.json({ success: true, data: orders })
    } catch (error) {
        console.error("Failed to list rental bookings", error);
        return res.status(500).json({ success: false, message: "Unable to list rental bookings" })
    }
}

export const updateStatus = async (req, res) => {
    try {
        const allowedStatuses = ["Booked", "Out for delivery", "Active", "Returned", "Cancelled"];
        if (typeof req.body.orderId !== "string" || !/^[a-f\d]{24}$/i.test(req.body.orderId) || !allowedStatuses.includes(req.body.status)) {
            return res.status(400).json({ success: false, message: "Invalid booking status update" });
        }
        const order = await orderModel.findById(req.body.orderId);
        if (!order) return res.status(404).json({ success: false, message: "Rental booking not found" });
        if (!order.payment) return res.status(409).json({ success: false, message: "Only paid bookings can be updated" });
        if (req.body.status !== order.status && !bookingStatusTransitions[order.status]?.includes(req.body.status)) {
            return res.status(409).json({ success: false, message: "This booking cannot move to the selected status" });
        }
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        return res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        console.error("Failed to update rental booking status", error);
        return res.status(500).json({ success: false, message: "Unable to update rental booking status" })
    }
}
