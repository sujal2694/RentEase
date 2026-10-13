import React from 'react'
import './Products.css'
import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'
import { productPath } from '../../utils/productUrl'

const Products = () => {
    const { productsList, productsLoaded, productLoadError, url } = useContext(StoreContext);
    return (
        <div className='products-container'>
            <div className='head-pro'>
                <div className='products-heading'>
                    <div>
                        <span className="section-eyebrow">Thoughtfully selected</span>
                        <h2>Furniture & appliance rentals</h2>
                    </div>
                    <Link className="view-all-rentals" to="/products">View all rentals <span aria-hidden="true">→</span></Link>
                </div>
                <p>Quality furniture and appliances with transparent rental pricing.</p>
            </div>
            <div className='products-list'>
                {productsList.slice(0, 4).map((item) => (
                    <Link key={item._id} className='item-box' to={productPath(item)}>
                        <div className="item">
                            <div className='img-container'>
                                <img src={`${url}/images/${item.image}`} alt={item.name} loading="lazy" width="640" height="480" />
                            </div>
                            <div className='item-details'>
                                <h3 className='item-name'>{item.name}</h3>
                                <p className='item-price'>₹{item.monthlyRent}<span> / month</span></p>
                                <p className='item-deposit'>₹{item.securityDeposit} refundable deposit</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            {productsLoaded && productsList.length === 0 && (
                <p className="featured-empty">{productLoadError || "Our rental collection is being refreshed. Please check back soon."}</p>
            )}
        </div>
    )
}

export default Products
