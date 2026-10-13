import React from 'react'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import './Hero.css'

const Hero = () => {
    const navigate = useNavigate();
    return (
        <div className='hero'>
            <div className='hero-inner'>
                <img className="hero-image" src={assets.hero_img} alt="A welcoming modern living room" />
                <div className="hero-shade" aria-hidden="true"></div>
                <div className="text-container">
                    <span className="hero-eyebrow">A more flexible way to feel at home</span>
                    <h1>Make room for living, not buying.</h1>
                    <p>Rent thoughtfully selected furniture and appliances with flexible terms, transparent monthly pricing, and refundable security deposits.</p>
                    <div className="hero-actions">
                        <button onClick={() => navigate('/products')} className='hero-btn'>Explore rentals <span aria-hidden="true">→</span></button>
                        <span className="hero-promise">Clear pricing · Flexible terms</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero
