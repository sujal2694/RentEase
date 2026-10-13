import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
    return (
        <div>
            <div className="footer">
                <div className='footer-head'>
                    <h2>RentEase</h2>
                    <p>Flexible furniture and appliance rentals for the way you live. Choose a rental term, see every charge up front, and get delivery to your door.</p>
                </div>

                <div className="links">
                    <ul className="nav-links">
                        <h2>Quick Links</h2>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/about">About</Link></li>
                        <li><Link to="/products">Browse Rentals</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                    </ul>

                    <ul className="social-links">
                        <h2>Your Rentals</h2>
                        <li><Link to="/products">Browse the catalog</Link></li>
                        <li><Link to="/cart">Rental basket</Link></li>
                        <li><Link to="/myorders">My bookings</Link></li>
                        <li><Link to="/contact">Rental support</Link></li>
                    </ul>
                </div>
            </div>
            <p className='footer-text-para'>Copyright &copy;{new Date().getFullYear()} RentEase. All rights reserved.</p>
        </div>
    )
}

export default Footer
