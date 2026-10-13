import React, { useContext, useEffect } from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const Verify = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");
    const sessionId = searchParams.get("session_id");
    const cancelled = searchParams.get("cancelled");
    const { url, clearRentalBasket } = useContext(StoreContext);
    const navigate = useNavigate();

    useEffect(() => {
        let active = true;
        const verifyPayment = async () => {
            if (cancelled) {
                toast("Payment was cancelled. Your rental basket is still saved.");
                navigate("/cart", { replace: true });
                return;
            }
            if (!orderId || !sessionId) {
                toast.error("Payment verification details are missing");
                navigate("/cart", { replace: true });
                return;
            }
            try {
                const response = await axios.post(url + "/api/order/verify", { orderId, session_id: sessionId });
                if (!active) return;
                if (response.data.success) {
                    clearRentalBasket();
                    toast.success("Your rental booking is confirmed");
                    navigate("/myorders", { replace: true });
                } else {
                    toast.error(response.data.message || "Payment could not be verified");
                    navigate("/cart", { replace: true });
                }
            } catch (error) {
                console.error("Payment verification failed", error);
                if (active) {
                    toast.error(error.response?.data?.message || "Unable to verify payment");
                    navigate("/cart", { replace: true });
                }
            }
        };

        verifyPayment();
        return () => { active = false; };
    }, [orderId, sessionId, cancelled, url, navigate, clearRentalBasket]);

    return (
        <div className='verify'>
            <div className="spinner"></div>
            <p>Confirming your rental booking...</p>
        </div>
    );
};

export default Verify
