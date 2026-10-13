import React, { useContext, useEffect, useState } from 'react'
import "./PlaceOrder.css"
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const PlaceOrder = () => {
    const { getTotalcartAmt, getSecurityDepositTotal, productsList, cartItems, rentalTerms, url, token, deliveryFees } = useContext(StoreContext);
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [data, setData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        street: "",
        city: "",
        state: "",
        pinCode: "",
        phone: ""
    })

    const onChangehandler = (event) => {
        const { name, value } = event.target;
        setData(current => ({ ...current, [name]: value }));
    }

    const placeOrder = async (event) => {
        event.preventDefault();
        if (!token || submitting) return;
        const items = Object.entries(cartItems).map(([productId, quantity]) => ({
            productId,
            quantity,
            rentalMonths: Number(rentalTerms[productId] || 1),
        })).filter((item) => item.quantity > 0);
        if (items.length === 0) {
            toast.error("Your rental basket is empty");
            navigate("/cart");
            return;
        }
        setSubmitting(true);
        try {
            const response = await axios.post(url + "/api/order/place", { address: data, items }, { headers: { token } });
            if (!response.data.success) {
                toast.error(response.data.message || "Unable to start your rental booking");
                return;
            }
            if (!response.data.session_url) {
                toast.error("Payment checkout could not be started");
                return;
            }
            window.location.assign(response.data.session_url);
        } catch (error) {
            console.error("Unable to start rental booking", error);
            toast.error(error.response?.data?.message || "Unable to start your rental booking. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    useEffect(() => {
        if (!token) navigate('/cart');
        else if (getTotalcartAmt() === 0) navigate('/cart');
    }, [token, getTotalcartAmt, navigate])

    const dueToday = getTotalcartAmt() + getSecurityDepositTotal() + deliveryFees;

    return (
        <div className='place-order-container'>
            <form onSubmit={placeOrder} className="place-order">
                <div className="place-order-left">
                    <p className="title">Rental delivery details</p>
                    <p className="booking-intro">Your rental term, rent and refundable deposits are listed in the order summary.</p>
                    <div className="multi-fields">
                        <input name="firstname" value={data.firstname} onChange={onChangehandler} type="text" placeholder="First name" autoComplete="given-name" required />
                        <input name="lastname" value={data.lastname} onChange={onChangehandler} type="text" placeholder="Last name" autoComplete="family-name" required />
                    </div>
                    <input name="email" value={data.email} onChange={onChangehandler} type="email" placeholder="Email address" autoComplete="email" required />
                    <input name="street" value={data.street} onChange={onChangehandler} type="text" placeholder="Street address" autoComplete="street-address" required />
                    <div className="multi-fields">
                        <input name="city" value={data.city} onChange={onChangehandler} type="text" placeholder="City" autoComplete="address-level2" required />
                        <input name="state" value={data.state} onChange={onChangehandler} type="text" placeholder="State" autoComplete="address-level1" required />
                    </div>
                    <div className="multi-fields">
                        <input name="pinCode" value={data.pinCode} onChange={onChangehandler} type="text" placeholder="PIN code" autoComplete="postal-code" required />
                        <input name="phone" value={data.phone} onChange={onChangehandler} type="tel" placeholder="Phone" autoComplete="tel" required />
                    </div>
                </div>
                <div className="cart-total">
                    <h1>Booking summary</h1>
                    <ul className="cart-bill">
                        {Object.entries(cartItems).map(([id, quantity]) => {
                            const product = productsList.find((item) => item._id === id);
                            if (!product || quantity < 1) return null;
                            const months = Number(rentalTerms[id] || 1);
                            return <li key={id} className='order-line'>
                                <p>{product.name} × {quantity}<small>{months}-month rental · ₹{product.monthlyRent}/month</small></p>
                                <span>₹{Number(product.monthlyRent) * months * quantity}</span>
                            </li>
                        })}
                        <li className='cart-total-price'><p>Rental charges:</p><span>₹{getTotalcartAmt()}</span></li>
                        <li className='cart-total-price'><p>Refundable deposits:</p><span>₹{getSecurityDepositTotal()}</span></li>
                        <li className='cart-total-price'><p>Delivery and setup:</p><span>₹{deliveryFees}</span></li>
                        <hr className='section' />
                        <li className='cart-total-bill'><p>Due today:</p><span>₹{dueToday}</span></li>
                    </ul>
                    <p className="deposit-note">Security deposits are refundable after the rental is returned in good condition.</p>
                    <button disabled={submitting} type='submit' className='cart-rent-btn'>{submitting ? "Preparing booking..." : "Continue to secure payment"}</button>
                </div>
            </form>
        </div>
    )
}

export default PlaceOrder
