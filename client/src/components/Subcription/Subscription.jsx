import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Subscription.css'

const Subcription = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className='subscription-section'>
        <div className="subscription-heading">
            <h2>Find the right rental for your space</h2>
            <p>Explore furniture and appliances with clear pricing, flexible terms, and refundable deposits.</p>
        </div>
        <div className="subscription-form">
            <button type='button' onClick={() => navigate('/products')}>Browse rentals</button>
        </div>
      </div>
    </div>
  )
}

export default Subcription
