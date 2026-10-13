import React, { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const links = [
  { to: '/', end: true, icon: '⌂', label: 'Overview', short: 'Overview' },
  { to: '/orders', icon: '▤', label: 'Bookings', short: 'Bookings' },
  { to: '/catalog', icon: '▦', label: 'Rental catalog', short: 'Catalog' },
  { to: '/add', icon: '+', label: 'Add rental item', short: 'Add' },
]

const Sidebar = ({ open, onClose }) => {
  const location = useLocation()
  const drawerRef = useRef(null)
  const triggerRef = useRef(null)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 1023px)').matches)
  const closeDrawer = useCallback(() => {
    onClose()
    if (isMobile) triggerRef.current?.focus()
  }, [onClose, isMobile])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)')
    const update = event => setIsMobile(event.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!open) return
    triggerRef.current = document.querySelector('.admin-menu-toggle')
    drawerRef.current?.querySelector('a')?.focus()
  }, [open])

  useEffect(() => {
    closeDrawer()
  }, [location.pathname, closeDrawer])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = event => {
      if (event.key === 'Escape') {
        closeDrawer()
        return
      }
      if (event.key !== 'Tab' || !drawerRef.current) return
      const focusable = [...drawerRef.current.querySelectorAll('a[href], button:not([disabled]), summary')]
      if (!focusable.length) return
      if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault()
        focusable.at(-1).focus()
      } else if (!event.shiftKey && document.activeElement === focusable.at(-1)) {
        event.preventDefault()
        focusable[0].focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, closeDrawer])

  return <>
    <button className={`drawer-scrim${open ? ' is-open' : ''}`} aria-label="Close navigation menu" aria-hidden={!open} tabIndex={open ? 0 : -1} onClick={closeDrawer} />
    <aside ref={drawerRef} id="admin-navigation" className={`admin-sidebar${open ? ' is-open' : ''}`} aria-label="Admin navigation" aria-hidden={!open && isMobile} inert={!open && isMobile}>
      <span className="sidebar-caption">WORKSPACE</span>
      <nav>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `sidebar-link${isActive || (link.to === '/add' && location.pathname.startsWith('/edit/')) ? ' is-active' : ''}`} aria-current={location.pathname.startsWith('/edit/') && link.to === '/add' ? 'page' : undefined} aria-label={link.label}>
            <span className="sidebar-link-icon" aria-hidden="true">{link.icon}</span>
            <span className="sidebar-link-label">{link.label}</span>
            <span className="sidebar-mobile-label" aria-hidden="true">{link.short}</span>
          </NavLink>
        ))}
      </nav>
      <details className="sidebar-help">
        <summary><span className="sidebar-help-mark">R</span><strong>Workspace help</strong></summary>
        <p>Manage products, rental rates, and customer bookings from one place.</p>
      </details>
    </aside>
    <nav className="admin-bottom-nav" aria-label="Quick navigation">
      {links.map(link => <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `bottom-nav-link${isActive || (link.to === '/add' && location.pathname.startsWith('/edit/')) ? ' is-active' : ''}`} aria-current={location.pathname.startsWith('/edit/') && link.to === '/add' ? 'page' : undefined} aria-label={link.label}><span aria-hidden="true">{link.icon}</span><small>{link.short}</small></NavLink>)}
    </nav>
  </>
}

export default Sidebar
