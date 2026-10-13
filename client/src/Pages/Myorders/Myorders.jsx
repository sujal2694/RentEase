import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { StoreContext } from '../../context/StoreContext'
import './Myorders.css'

const Myorders = () => {
  const { url, token, setLoginPopUp } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setLoginPopUp(true);
      navigate('/', { replace: true });
      return;
    }
    let active = true;
    axios.post(`${url}/api/order/userOrders`, {}, { headers: { token } })
      .then((response) => {
        if (!active) return;
        if (!response.data.success) throw new Error(response.data.message || "Unable to load your bookings");
        setOrders(response.data.data);
      })
      .catch((error) => {
        console.error("Unable to load rental bookings", error);
        if (active) toast.error(error.response?.data?.message || error.message || "Unable to load rental bookings");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, url, navigate, setLoginPopUp]);

  return (
    <main className="my-rentals">
      <h1>My rental bookings</h1>
      {loading ? <p>Loading your bookings...</p> : orders.length === 0
        ? <section className="no-bookings">
          <p>No rental bookings yet.</p>
          <button onClick={() => navigate('/products')}>Explore rentals</button>
        </section>
        : <div className="booking-list">
          {orders.map((order) => (
            <article className="booking-card" key={order._id}>
              <header>
                <div><h2>Booking #{order._id.slice(-8).toUpperCase()}</h2><p>{new Date(order.date).toLocaleDateString()}</p></div>
                <span className={order.payment ? "booking-status paid" : "booking-status"}>{order.status || (order.payment ? "Booked" : "Awaiting payment")}</span>
              </header>
              <ul>
                {(order.items || []).map((item, index) => (
                  <li key={`${item.productId}-${index}`}>
                    <span>{item.name} × {item.quantity} · {item.rentalMonths} month{item.rentalMonths > 1 ? "s" : ""}</span>
                    <span>₹{item.rentalAmount}</span>
                  </li>
                ))}
              </ul>
              <p>Refundable security deposit: ₹{order.depositAmount}</p>
              <strong>Paid today: ₹{order.amount}</strong>
            </article>
          ))}
        </div>}
    </main>
  )
}

export default Myorders
