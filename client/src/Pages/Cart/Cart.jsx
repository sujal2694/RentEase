import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import './Cart.css'
import { StoreContext } from '../../context/StoreContext'

const rentalOptions = [1, 3, 6, 12]

const Cart = () => {
  const { cartItems, cartReady, cartLoadError, getTotalcartAmt, getSecurityDepositTotal, addTocart, removeFromcart, productsList, url, rentalTerms, setRentalTerm, deliveryFees, token, setLoginPopUp } = useContext(StoreContext);
  const navigate = useNavigate();
  const rentalTotal = getTotalcartAmt();
  const depositTotal = getSecurityDepositTotal();
  const bookingTotal = rentalTotal + depositTotal + (rentalTotal > 0 ? deliveryFees : 0);
  const onCheckout = () => {
    if (!Object.keys(cartItems).length) return;
    if (!token) {
      setLoginPopUp(true);
      return;
    }
    navigate("/placeorder");
  }

  return (
    <div className='cart'>
      <div className="cart-products">
        {!cartReady
          ? <p className="basket-loading">{cartLoadError || "Loading your saved rental basket..."}</p>
          : Object.keys(cartItems).length > 0
          ? <div>
            <div className="cart-products-list">
              {Object.keys(cartItems).map((itemId) => {
                  const qty = cartItems[itemId];
                  const itemInfo = productsList.find((p) => p._id === itemId);
                  const months = Number(rentalTerms[itemId] || 1);
                  return qty > 0 && itemInfo ? (
                    <div key={itemId} className="cart-item-row">
                      <img className='cart-item-img object-fit-contain' src={`${url}/images/${itemInfo.image}`} alt="" />
                      <div className="cart-item-detail">
                        <h2>{itemInfo.name}</h2>
                        <span>₹{itemInfo.monthlyRent}/month · ₹{itemInfo.dailyRent}/day</span>
                        <span>Refundable deposit: ₹{itemInfo.securityDeposit} per item</span>
                        <label htmlFor={`cart-term-${itemId}`}>Rental duration</label>
                        <select id={`cart-term-${itemId}`} value={months} onChange={(event) => setRentalTerm(itemId, event.target.value)}>
                          {rentalOptions.map((term) => <option key={term} value={term}>{term} month{term > 1 ? 's' : ''}</option>)}
                        </select>
                      </div>
                      <div className="cart-item-actions">
                        <div className='rental-quantity'>
                          <button aria-label={`Remove one ${itemInfo.name}`} onClick={() => removeFromcart(itemId)}>−</button>
                          <span>{qty}</span>
                          <button aria-label={`Add one ${itemInfo.name}`} onClick={() => addTocart(itemId)}>+</button>
                        </div>
                        <span>Rent: ₹{Number(itemInfo.monthlyRent) * months * qty}</span>
                      </div>
                    </div>
                  ) : null;
                })}
            </div>
          </div> : <div className='empty'>
            <p>Your rental basket is empty</p>
            <button onClick={() => navigate("/products")}>Browse rentals</button>
          </div>}
      </div>

      <div>
        <div className="cart-total">
          <h1>Rental summary</h1>
          <ul className="cart-bill">
            <li className='cart-total-price'>
              <p>Rental charges:</p>
              <span>₹{rentalTotal}</span>
            </li>
            <li className='cart-total-price'>
              <p>Refundable deposits:</p>
              <span>₹{depositTotal}</span>
            </li>
            <li className='cart-total-price'>
              <p>One-time delivery:</p>
              <span>₹{rentalTotal === 0 ? 0 : deliveryFees}</span>
            </li>
            <hr className='section' />
            <li className='cart-total-bill'>
              <p>Due today:</p>
              <span>₹{bookingTotal}</span>
            </li>
          </ul>
          <p className="deposit-note">Deposit is refundable after the rental is returned in good condition.</p>
          <button disabled={!cartReady || rentalTotal === 0} onClick={onCheckout} className='cart-rent-btn'>Continue to rental booking</button>
          {!token && <p className="signin-note">Sign in or create an account before adding rentals and booking.</p>}
        </div>


      </div>

    </div>
  )
}

export default Cart
