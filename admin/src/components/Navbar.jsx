import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = ({ admin, onLogout, onMenuToggle, drawerOpen }) => (
  <header className="admin-topbar">
    <button className="admin-menu-toggle" type="button" aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={drawerOpen} aria-controls="admin-navigation" onClick={onMenuToggle}>{drawerOpen ? '×' : '☰'}</button>
    <Link to="/" className="admin-brand" aria-label="RentEase admin dashboard">
      <span className="admin-brand-mark">R</span>
      <span><strong>RentEase</strong><small>RENTAL MANAGEMENT</small></span>
    </Link>
    <div className="admin-topbar-actions">
      <a className="storefront-link" href={import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:5173'} target="_blank" rel="noreferrer">View storefront <span aria-hidden="true">↗</span></a>
      <span className="admin-profile"><span className="admin-avatar">{(admin.name || 'A').slice(0, 1).toUpperCase()}</span><span className="admin-profile-name">{admin.name || 'Administrator'}</span></span>
      <button className="admin-logout" type="button" onClick={onLogout}>Sign out</button>
    </div>
  </header>
)

export default Navbar
