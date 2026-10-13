import { userModel } from "../user/userModel.js";
import { productModel } from "../product/productModel.js";

export const addTocart = async (req, res) => {
    try {
        const { itemid } = req.body;
        if (typeof itemid !== "string" || !/^[a-f\d]{24}$/i.test(itemid)) {
            return res.status(400).json({ success: false, message: "Invalid rental item" });
        }
        const product = await productModel.findById(itemid);
        if (!product) return res.status(404).json({ success: false, message: "Rental item not found" });
        const userData = await userModel.findById(req.body.userId);
        if (!userData) return res.status(404).json({ success: false, message: "User not found" });
        const cartData = { ...userData.cartData };
        if ((cartData[itemid] || 0) >= 20) {
            return res.status(400).json({ success: false, message: "Maximum rental quantity is 20" });
        }
        cartData[itemid] = (cartData[itemid] || 0) + 1;
        await userModel.findByIdAndUpdate(req.body.userId, { cartData });
        return res.json({ success: true, message: "Added to rental basket" });
    } catch (error) {
        console.error("Failed to add item to rental basket", error);
        return res.status(500).json({ success: false, message: "Unable to add item to rental basket" });
    }
}

export const removeFromcart = async (req, res) => {
    try {
        const { itemid } = req.body;
        if (typeof itemid !== "string" || !/^[a-f\d]{24}$/i.test(itemid)) {
            return res.status(400).json({ success: false, message: "Invalid rental item" });
        }
        const userData = await userModel.findById(req.body.userId);
        if (!userData) return res.status(404).json({ success: false, message: "User not found" });
        const cartData = { ...userData.cartData };
        if (cartData[req.body.itemid] > 1) {
            cartData[req.body.itemid] -= 1;
        } else {
            delete cartData[req.body.itemid];
        }
        const rentalTerms = { ...userData.rentalTerms };
        if (!cartData[req.body.itemid]) delete rentalTerms[req.body.itemid];
        await userModel.findByIdAndUpdate(req.body.userId, { cartData, rentalTerms });
        return res.json({ success: true, message: "Updated rental basket" });
    } catch (error) {
        console.error("Failed to update rental basket", error);
        return res.status(500).json({ success: false, message: "Unable to update rental basket" });
    }
}

export const getCart = async (req, res) => {
    try {
        const userData = await userModel.findById(req.body.userId);
        if (!userData) return res.status(404).json({ success: false, message: "User not found" });
        return res.json({ success: true, cartData: userData.cartData, rentalTerms: userData.rentalTerms });
    } catch (error) {
        console.error("Failed to load rental basket", error);
        return res.status(500).json({ success: false, message: "Unable to load rental basket" });
    }
}

export const setRentalTerm = async (req, res) => {
    const { itemid, months } = req.body;
    const allowedTerms = [1, 3, 6, 12];
    if (!itemid || !allowedTerms.includes(Number(months))) {
        return res.status(400).json({ success: false, message: "Choose a valid rental term" });
    }
    try {
        const userData = await userModel.findById(req.body.userId);
        if (!userData) return res.status(404).json({ success: false, message: "User not found" });
        if (!/^[a-f\d]{24}$/i.test(itemid) || !userData.cartData[itemid]) {
            return res.status(400).json({ success: false, message: "Add this rental to your basket first" });
        }
        const rentalTerms = { ...userData.rentalTerms, [itemid]: Number(months) };
        await userModel.findByIdAndUpdate(req.body.userId, { rentalTerms });
        return res.json({ success: true, rentalTerms });
    } catch (error) {
        console.error("Failed to update rental term", error);
        return res.status(500).json({ success: false, message: "Unable to update rental term" });
    }
}
