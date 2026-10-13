import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';
import './About.css';

const About = () => (
  <main className="about-page">
    <section className="about-hero">
      <div className="about-hero-copy">
        <span className="about-eyebrow">A little more room to live</span>
        <h1>Make yourself at home, <em>wherever life takes you.</em></h1>
        <p>
          RentEase makes it easier to create a space that feels like yours,
          without the big upfront cost or long-term commitment of buying.
        </p>
        <Link className="about-primary-link" to="/products">Explore our rentals <span aria-hidden="true">→</span></Link>
      </div>
      <div className="about-hero-image">
        <img src={assets.hero_img} alt="A warm, welcoming furnished living room" />
        <span>Comfort that moves with you.</span>
      </div>
    </section>

    <section className="about-intro" aria-labelledby="about-intro-title">
      <span className="about-eyebrow">The RentEase way</span>
      <h2 id="about-intro-title">A home should feel like yours.<br />Getting there should feel easy.</h2>
      <p>
        Whether you’re settling into a new place, between homes, or simply ready
        for a change, we bring together thoughtfully selected furniture and
        everyday appliances with rental terms designed around real life.
      </p>
    </section>

    <section className="about-benefits" aria-label="Why rent with RentEase">
      <article className="about-benefit">
        <span className="about-benefit-number">01</span>
        <h3>Choose what fits</h3>
        <p>Find useful pieces for your space, from everyday appliances to the furniture that makes it feel like home.</p>
      </article>
      <article className="about-benefit">
        <span className="about-benefit-number">02</span>
        <h3>Know the numbers</h3>
        <p>See the rental price and refundable security deposit before you book. No surprises at checkout.</p>
      </article>
      <article className="about-benefit">
        <span className="about-benefit-number">03</span>
        <h3>Rent on your terms</h3>
        <p>Choose a rental duration that works for your plans, then manage your bookings from your account.</p>
      </article>
    </section>

    <section className="about-cta">
      <div>
        <span className="about-eyebrow">Your next chapter starts here</span>
        <h2>Make room for living, not buying.</h2>
      </div>
      <Link className="about-primary-link" to="/products">Browse rentals <span aria-hidden="true">→</span></Link>
    </section>
  </main>
);

export default About;
