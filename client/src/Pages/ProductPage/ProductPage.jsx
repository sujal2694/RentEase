import React, { useContext } from 'react'
import './ProductPage.css'
import { StoreContext } from '../../context/StoreContext'
import { Link } from 'react-router-dom'
import { productPath } from '../../utils/productUrl'

const rentalOptions = [1, 3, 6, 12]

const ProductPage = () => {
  const { addTocart, removeFromcart, cartItems, cartReady, rentalTerms, setRentalTerm, productsList, productsLoaded, productLoadError, url } = useContext(StoreContext);
  return (
    <main className='product-page'>
      <header className="product-page-title">
        <h1>Furniture & appliance <span>rentals</span></h1>
        <p>Choose your rental period. Monthly rent and refundable deposit are shown up front.</p>
      </header>
      <div className="products">
        {productsList.map((item) => (
          <article className='rental-item' key={item._id}>
            <Link className="rental-item-image-link" to={productPath(item)} aria-label={`View ${item.name} rental details`}><img className="item-img" src={`${url}/images/${item.image}`} alt={item.name} loading="lazy" width="640" height="480" /></Link>
            <div className="rental-item-info">
              <h2 className='item-name'><Link to={productPath(item)}>{item.name}</Link></h2>
              <p className="rental-price">₹{item.dailyRent}/day <span>·</span> ₹{item.monthlyRent}/month</p>
              <p className="rental-deposit">Refundable security deposit: ₹{item.securityDeposit}</p>
              <label className="rental-term-label" htmlFor={`term-${item._id}`}>Rental duration</label>
              <select
                id={`term-${item._id}`}
                disabled={!cartReady}
                value={rentalTerms[item._id] || 1}
                onChange={(event) => setRentalTerm(item._id, event.target.value)}
              >
                {rentalOptions.map((months) => <option key={months} value={months}>{months} month{months > 1 ? 's' : ''}</option>)}
              </select>
              {!cartItems[item._id]
                ? <button disabled={!cartReady} className="rental-add-btn" onClick={() => addTocart(item._id)}>Add to rental basket</button>
                : <div className='rental-quantity' aria-label={`Quantity of ${item.name}`}>
                  <button aria-label={`Remove one ${item.name}`} onClick={() => removeFromcart(item._id)}>−</button>
                  <span>{cartItems[item._id]} in basket</span>
                  <button aria-label={`Add one ${item.name}`} onClick={() => addTocart(item._id)}>+</button>
                </div>}
            </div>
          </article>
        ))}
      </div>
      {productsList.length === 0 && <p className="no-rentals">{productLoadError || (productsLoaded ? "No rental items are currently available." : "Loading rental items...")}</p>}
    </main>
  )
}

export default ProductPage
