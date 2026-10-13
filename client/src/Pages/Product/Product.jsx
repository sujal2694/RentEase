import React, { useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'
import { productPath } from '../../utils/productUrl'
import './Product.css'

const rentalOptions = [1, 3, 6, 12]

const Product = () => {
  const { id, slug } = useParams();
  const { productsList, productsLoaded, productLoadError, url, rentalTerms, setRentalTerm, cartItems, cartReady, addTocart, removeFromcart } = useContext(StoreContext);
  const product = slug
    ? productsList.find((item) => productPath(item) === `/products/${slug}`)
    : productsList.find((item) => item._id === id);

  if (!product) {
    return <main className="product-detail-empty">{productsLoaded ? "This rental item could not be found." : productLoadError || "Loading rental item..."}</main>;
  }

  const months = Number(rentalTerms[product._id] || 1);
  return (
    <main className="product-detail">
      <img src={`${url}/images/${product.image}`} alt={product.name} width="800" height="600" fetchPriority="high" />
      <section>
        <Link className="back-to-rentals" to="/products">← Browse rentals</Link>
        <h1>{product.name}</h1>
        <p className="product-detail-description">{product.description || "A quality item ready to make your space feel like home."}</p>
        <p className="product-detail-rate">₹{product.dailyRent} <span>/ day</span> <b>·</b> ₹{product.monthlyRent} <span>/ month</span></p>
        <p className="product-detail-deposit">Refundable security deposit: <strong>₹{product.securityDeposit}</strong></p>
        <label htmlFor="product-rental-term">Choose your rental duration</label>
        <select id="product-rental-term" value={months} onChange={(event) => setRentalTerm(product._id, event.target.value)} disabled={!cartReady}>
          {rentalOptions.map((term) => <option key={term} value={term}>{term} month{term > 1 ? 's' : ''} · ₹{product.monthlyRent * term} rent</option>)}
        </select>
        {!cartItems[product._id]
          ? <button className="product-detail-add" disabled={!cartReady} onClick={() => addTocart(product._id)}>Add to rental basket</button>
          : <div className="product-detail-quantity">
            <button aria-label={`Remove one ${product.name}`} onClick={() => removeFromcart(product._id)}>−</button>
            <span>{cartItems[product._id]} in rental basket</span>
            <button aria-label={`Add one ${product.name}`} onClick={() => addTocart(product._id)}>+</button>
          </div>}
      </section>
    </main>
  )
}

export default Product
