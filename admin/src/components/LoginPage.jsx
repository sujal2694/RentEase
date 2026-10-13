import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Input } from './AdminUI'

const LoginPage = ({ url, onAuthenticate, setupRequired, setupChecked, setupError }) => {
  const [isSetup, setIsSetup] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [authError, setAuthError] = useState('')
  const [data, setData] = useState({ name: '', email: '', password: '' })

  const onSubmit = async event => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setAuthError('')
    try {
      const response = await axios.post(`${url}/api/admin/${isSetup ? 'register' : 'login'}`, data)
      if (!response.data.success) throw new Error(response.data.message || 'Unable to sign in')
      onAuthenticate({ token: response.data.token, name: response.data.name, email: response.data.email, remember })
      toast.success(isSetup ? 'Admin workspace created' : 'Welcome back')
    } catch (error) {
      console.error('Admin authentication failed', error)
      const message = error.response?.data?.message || error.message || 'Unable to sign in'
      setAuthError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-screen">
      <a className="skip-to-content" href="#admin-login-form">Skip to sign in</a>
      <section className="admin-login-card">
        <div className="login-side-panel">
          <span className="admin-brand-mark login-mark">R</span>
          <p className="login-side-label">RENTEASE ADMIN</p>
          <h1>Make every rental feel effortless.</h1>
          <p className="login-side-copy">Your calm, clear workspace for managing the RentEase catalog and customer bookings.</p>
          <span className="login-side-foot">Furniture & appliance rentals</span>
        </div>
        <div className="login-form-panel">
          <span className="page-eyebrow">{isSetup ? 'First-time setup' : 'ADMIN WORKSPACE'}</span>
          <h2>{isSetup ? 'Create your admin account' : 'Welcome back'}</h2>
          <p className="login-form-copy">{isSetup ? 'Set up the first administrator account to get started.' : 'Sign in to manage your rental business.'}</p>
          <form id="admin-login-form" onSubmit={onSubmit} noValidate>
            {isSetup && (
              <Input id="admin-name" label="Organization name" value={data.name} onChange={event => setData(current => ({ ...current, name: event.target.value }))} name="name" autoComplete="organization" placeholder="RentEase" required maxLength={100} />
            )}
            <label className="admin-field">
              <span>Email address</span>
              <input autoFocus value={data.email} onChange={event => { setData(current => ({ ...current, email: event.target.value })); setAuthError('') }} name="email" type="email" autoComplete="email" placeholder="you@company.com" required aria-invalid={Boolean(authError)} aria-describedby={authError ? 'admin-login-error' : undefined} />
            </label>
            <label className="admin-field">
              <span>Password</span>
              <span className="password-control"><input value={data.password} onChange={event => { setData(current => ({ ...current, password: event.target.value })); setAuthError('') }} name="password" type={showPassword ? 'text' : 'password'} autoComplete={isSetup ? 'new-password' : 'current-password'} placeholder={isSetup ? 'At least 8 characters' : 'Your password'} minLength={isSetup ? 8 : 1} required aria-invalid={Boolean(authError)} aria-describedby={authError ? 'admin-login-error' : undefined} /><button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? 'Hide' : 'Show'}</button></span>
            </label>
            {!isSetup && <label className="remember-control"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} /><span>Remember me on this device</span></label>}
            {authError && <p className="field-error login-error" id="admin-login-error" role="alert">{authError}</p>}
            <button className="admin-primary-button login-submit" disabled={submitting} type="submit">{submitting ? 'Please wait…' : isSetup ? 'Create admin account' : 'Sign in'} <span aria-hidden="true">→</span></button>
          </form>
          {setupChecked && setupRequired && !isSetup && <p className="login-switch">First time here? <button type="button" onClick={() => setIsSetup(true)}>Set up the first admin</button></p>}
          {isSetup && <p className="login-switch"><button type="button" onClick={() => setIsSetup(false)}>Back to sign in</button></p>}
          {!setupChecked && <p className="login-footnote">Connecting to your admin service…</p>}
          {setupError && <p className="login-footnote">Check your backend URL and make sure the admin service is running.</p>}
          {setupChecked && !setupRequired && !setupError && <p className="login-footnote">Admin account setup is managed by your organization.</p>}
        </div>
      </section>
    </main>
  )
}

export default LoginPage
