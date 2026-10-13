import React, { useEffect, useRef } from 'react'
import { Toaster } from 'react-hot-toast'

export const Button = ({ variant = 'primary', className = '', ...props }) => (
  <button className={`admin-${variant}-button ${className}`.trim()} {...props} />
)

export const Input = ({ id, label, description, error, required, className = '', ...props }) => {
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined
  return <label htmlFor={id} className={`admin-field ${className}`.trim()}>
    <span>{label}{required && <> <b className="required-marker" aria-hidden="true">*</b><span className="visually-hidden"> (required)</span></>}</span>
    <input id={id} required={required} aria-required={required || undefined} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...props} />
    {description && <small className="field-hint" id={descriptionId}>{description}</small>}
    {error && <small className="field-error" id={errorId} role="alert">{error}</small>}
  </label>
}

export const Select = ({ id, label, children, className = '', ...props }) => (
  <label htmlFor={id} className={className}>
    <span>{label}</span><select id={id} {...props}>{children}</select>
  </label>
)

export const Card = ({ as = 'article', className = '', ...props }) => (
  React.createElement(as, { className: `admin-panel ${className}`.trim(), ...props })
)

export const ToastRegion = () => (
  <Toaster position="top-right" toastOptions={{ ariaProps: { role: 'status', 'aria-live': 'polite' } }} />
)

export const PageHeader = ({ eyebrow, title, description, action }) => (
  <header className="page-heading">
    <div><span className="page-eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>
    {action && <div className="page-heading-action">{action}</div>}
  </header>
)

export const Badge = ({ children, className = '' }) => (
  <span className={`status-pill ${className}`.trim()}>{children}</span>
)

export const Skeleton = ({ className = '', lines = 1 }) => (
  <div className={`skeleton ${className}`.trim()} aria-hidden="true">
    {Array.from({ length: lines }, (_, index) => <span key={index} />)}
  </div>
)

export const EmptyState = ({ icon = '▦', title, description, action }) => (
  <Card as="section" className="catalog-empty" aria-live="polite">
    <span aria-hidden="true">{icon}</span><h2>{title}</h2><p>{description}</p>{action}
  </Card>
)

export const Modal = ({ title, description, children, onClose }) => {
  const dialogRef = useRef(null)
  const previousFocus = useRef(null)

  useEffect(() => {
    previousFocus.current = document.activeElement
    const dialog = dialogRef.current
    const focusable = () => [...dialog.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    focusable()[0]?.focus()
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return
      const elements = focusable()
      if (!elements.length) return
      if (event.shiftKey && document.activeElement === elements[0]) {
        event.preventDefault()
        elements.at(-1).focus()
      } else if (!event.shiftKey && document.activeElement === elements.at(-1)) {
        event.preventDefault()
        elements[0].focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previousFocus.current?.focus?.()
    }
  }, [onClose])

  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description" ref={dialogRef}>
      <span className="modal-warning-icon" aria-hidden="true">!</span><h2 id="modal-title">{title}</h2><p id="modal-description">{description}</p>{children}
    </section>
  </div>
}

export const DataSkeletons = ({ cards = 3 }) => (
  <div className="skeleton-grid" aria-label="Loading data" role="status">
    <span className="visually-hidden">Loading data…</span>
    {Array.from({ length: cards }, (_, index) => <div className="skeleton-card" key={index}><Skeleton className="skeleton-image" /><Skeleton lines={3} /></div>)}
  </div>
)
