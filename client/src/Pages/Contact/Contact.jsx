import React from 'react';
import './Contact.css';

const supportEmail = 'example@gmail.com';

const Contact = () => {
  const onSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const subject = String(formData.get('subject') || '').trim();
    const message = String(formData.get('message') || '').trim();
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <main className="contact-page">
      <header className="contact-heading">
        <span className="contact-eyebrow">We’re happy to help</span>
        <h1>Let’s talk about <em>your next home.</em></h1>
        <p>Questions about a rental, your booking, or how it all works? Send us a note and we’ll be glad to help.</p>
      </header>

      <div className="contact-layout">
        <aside className="contact-details">
          <span className="contact-details-label">Get in touch</span>
          <h2>Good things start with a conversation.</h2>
          <p>Tell us what you need. We’re here to help make renting feel simple.</p>
          <div className="contact-detail">
            <span className="contact-detail-icon" aria-hidden="true"><i className="bx bx-envelope"></i></span>
            <div>
              <span>Email us</span>
              <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
            </div>
          </div>
          <div className="contact-detail">
            <span className="contact-detail-icon" aria-hidden="true"><i className="bx bx-help-circle"></i></span>
            <div>
              <span>What we can help with</span>
              <p>Rentals, bookings, delivery, and account questions</p>
            </div>
          </div>
          <div className="contact-note">
            <i className="bx bx-message-rounded-dots" aria-hidden="true"></i>
            <p>Already booked? Include your booking details in your message so we can help faster.</p>
          </div>
        </aside>

        <form className="contact-form" onSubmit={onSubmit}>
          <h2>Send us a message</h2>
          <p className="contact-form-intro">Fill in the details below. Your email app will open with your message ready to send.</p>
          <div className="contact-field">
            <label htmlFor="contact-name">Your name</label>
            <input id="contact-name" name="name" type="text" autoComplete="name" placeholder="e.g. Alex Morgan" required />
          </div>
          <div className="contact-field">
            <label htmlFor="contact-email">Email address</label>
            <input id="contact-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
          </div>
          <div className="contact-field">
            <label htmlFor="contact-subject">What can we help with?</label>
            <input id="contact-subject" name="subject" type="text" placeholder="e.g. A question about my booking" required />
          </div>
          <div className="contact-field">
            <label htmlFor="contact-message">Your message</label>
            <textarea id="contact-message" name="message" rows="5" placeholder="Tell us a little more..." required />
          </div>
          <button className="contact-submit-btn" type="submit">Write to our team <span aria-hidden="true">→</span></button>
          <p className="contact-privacy-note">This opens a message in your email app; it won’t be sent until you choose to send it.</p>
        </form>
      </div>
    </main>
  );
};

export default Contact;
