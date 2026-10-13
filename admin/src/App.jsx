import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import LoginPage from './components/LoginPage'
import { ToastRegion } from './components/AdminUI'
const Dashboard = lazy(() => import('./components/Dashboard'))
const AddItem = lazy(() => import('./components/AddItem'))
const OrderList = lazy(() => import('./components/OrderList'))
const ProductsList = lazy(() => import('./components/ProductsList'))

const url = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')

const App = () => {
  const location = useLocation()
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken') || localStorage.getItem('token') || '')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [admin, setAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adminProfile') || sessionStorage.getItem('adminProfile') || '{}')
    } catch {
      return {}
    }
  })
  const [setupRequired, setSetupRequired] = useState(false)
  const [setupError, setSetupError] = useState(false)
  const [setupChecked, setSetupChecked] = useState(false)

  const logout = useCallback((message) => {
    localStorage.removeItem('adminToken')
    sessionStorage.removeItem('adminToken')
    localStorage.removeItem('token')
    localStorage.removeItem('adminProfile')
    sessionStorage.removeItem('adminProfile')
    setToken('')
    setAdmin({})
    if (message) toast.error(message)
  }, [])

  useEffect(() => {
    const pageName = {
      '/': 'Overview',
      '/orders': 'Bookings',
      '/catalog': 'Rental catalog',
      '/add': 'Add rental item',
    }[location.pathname] || (location.pathname.startsWith('/edit/') ? 'Edit rental item' : 'Rental management')
    document.title = `${pageName} | RentEase Admin`
    let robots = document.querySelector('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.appendChild(robots)
    }
    robots.content = 'noindex, nofollow'
  }, [location.pathname])

  useEffect(() => {
    let active = true
    axios.get(`${url}/api/admin/setup-status`, { timeout: 10000 })
      .then(response => {
        if (active && response.data.success) setSetupRequired(response.data.setupRequired)
      })
      .catch(error => {
        console.error('Unable to check admin setup status', error)
        if (active) setSetupError(true)
        if (active) toast.error(error.response?.data?.message || 'Unable to connect to the admin service')
      })
      .finally(() => { if (active) setSetupChecked(true) })
    return () => { active = false }
  }, [])

  const authenticate = ({ token: nextToken, remember, ...profile }) => {
    const storage = remember ? localStorage : sessionStorage
    const otherStorage = remember ? sessionStorage : localStorage
    storage.setItem('adminToken', nextToken)
    storage.setItem('adminProfile', JSON.stringify(profile))
    otherStorage.removeItem('adminToken')
    otherStorage.removeItem('adminProfile')
    setAdmin(profile)
    setToken(nextToken)
    setSetupRequired(false)
  }
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const toggleDrawer = useCallback(() => setDrawerOpen(open => !open), [])

  const apiError = useCallback((error, fallback) => {
    if (error.response?.status === 401) {
      logout('Your admin session expired. Please sign in again.')
      return
    }
    toast.error(error.response?.data?.message || error.message || fallback)
  }, [logout])

  if (!token) {
    return (
      <>
        <LoginPage url={url} onAuthenticate={authenticate} setupRequired={setupRequired} setupChecked={setupChecked} setupError={setupError} />
        <ToastRegion />
      </>
    )
  }

  const pageProps = { url, token, onApiError: apiError }

  return (
    <div className="admin-app">
      <a className="skip-to-content" href="#admin-content">Skip to content</a>
      <Navbar admin={admin} onLogout={() => logout()} drawerOpen={drawerOpen} onMenuToggle={toggleDrawer} />
      <div className="admin-layout">
        <Sidebar open={drawerOpen} onClose={closeDrawer} />
        <main className="admin-main" id="admin-content" tabIndex="-1">
          <Suspense fallback={<div className="admin-loading" role="status">Loading workspace…</div>}>
            <Routes>
              <Route path="/" element={<Dashboard {...pageProps} />} />
              <Route path="/add" element={<AddItem {...pageProps} />} />
              <Route path="/edit/:id" element={<AddItem {...pageProps} />} />
              <Route path="/catalog" element={<ProductsList {...pageProps} />} />
              <Route path="/productsList" element={<Navigate to="/catalog" replace />} />
              <Route path="/orders" element={<OrderList {...pageProps} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <ToastRegion />
    </div>
  )
}

export default App
