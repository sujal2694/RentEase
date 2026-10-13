import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { DataSkeletons, EmptyState, PageHeader } from './AdminUI'

const money = value => `₹${Math.max(0, Number(value) || 0).toLocaleString('en-IN')}`

const Dashboard = ({ url, token, onApiError }) => {
  const [data, setData] = useState({ products: [], orders: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const config = { headers: { token } }
      const [productsResponse, ordersResponse] = await Promise.all([
        axios.get(`${url}/api/product/list`, config),
        axios.get(`${url}/api/order/list`, config),
      ])
      if (!productsResponse.data.success) throw new Error(productsResponse.data.message || 'Unable to load rental catalog')
      if (!ordersResponse.data.success) throw new Error(ordersResponse.data.message || 'Unable to load bookings')
      setData({ products: productsResponse.data.data, orders: ordersResponse.data.data })
      setError('')
    } catch (requestError) {
      console.error('Unable to load admin overview', requestError)
      setError(requestError.response?.data?.message || requestError.message || 'Unable to load dashboard')
      onApiError(requestError, 'Unable to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [url, token, onApiError])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  const paidOrders = data.orders.filter(order => order.payment)
  const liveOrders = paidOrders.filter(order => ['Booked', 'Out for delivery', 'Active'].includes(order.status))
  const depositsHeld = paidOrders.filter(order => !['Returned', 'Cancelled'].includes(order.status)).reduce((sum, order) => sum + Math.max(0, Number(order.depositAmount) || 0), 0)
  const recentOrders = data.orders.slice(0, 5)

  return (
    <section className="admin-page">
      <PageHeader eyebrow="YOUR BUSINESS, AT A GLANCE" title={<>Good morning<span className="heading-dot">.</span></>} description="Here’s what’s happening with your rental business." action={<Link className="admin-primary-button heading-action" to="/add"><span aria-hidden="true">＋</span> Add rental item</Link>} />
      {error && (data.products.length > 0 || data.orders.length > 0) && <div className="admin-error-banner" role="status"><span>{error}</span><button type="button" onClick={loadDashboard}>Retry</button></div>}
      {error && !data.products.length && !data.orders.length
        ? <EmptyState icon="!" title="We couldn’t load your workspace" description={error} action={<button className="admin-primary-button" type="button" onClick={loadDashboard}>Try again</button>} />
        : loading && !data.products.length && !data.orders.length
          ? <DataSkeletons cards={4} />
        : <>
          <div className="metric-grid">
            <article className="metric-card"><span className="metric-icon catalog-icon">▦</span><span className="metric-label">Catalog items</span><strong>{data.products.length}</strong><span className="metric-caption">Available rental listings</span></article>
            <article className="metric-card"><span className="metric-icon booking-icon">▤</span><span className="metric-label">Paid bookings</span><strong>{paidOrders.length}</strong><span className="metric-caption">Successfully paid bookings</span></article>
            <article className="metric-card"><span className="metric-icon active-icon">↗</span><span className="metric-label">Active rentals</span><strong>{liveOrders.length}</strong><span className="metric-caption">Booked, shipping, or active</span></article>
            <article className="metric-card"><span className="metric-icon deposit-icon">₹</span><span className="metric-label">Deposits held</span><strong>{money(depositsHeld)}</strong><span className="metric-caption">Refundable deposits on live rentals</span></article>
          </div>

          <div className="dashboard-grid">
            <section className="admin-panel recent-panel">
              <div className="panel-heading"><div><h2>Recent bookings</h2><p>Latest customer rental activity</p></div><Link to="/orders">View all <span aria-hidden="true">→</span></Link></div>
              {!recentOrders.length
                ? <div className="panel-empty"><span aria-hidden="true">▤</span><strong>No bookings yet</strong><p>New customer bookings will show here.</p><Link to="/orders">Open bookings</Link></div>
                : <div className="recent-list">{recentOrders.map(order => <Link className="recent-order" key={order._id} to="/orders">
                  <span className="recent-order-mark">{(order.address?.firstname || 'R').slice(0, 1).toUpperCase()}</span>
                  <span className="recent-order-info"><strong>{order.address?.firstname} {order.address?.lastname}</strong><small>#{order._id.slice(-8).toUpperCase()} · {new Date(order.date).toLocaleDateString()}</small></span>
                  <span className="recent-order-total">{money(order.amount)}</span>
                  <span className={`status-pill ${order.payment ? 'status-paid' : 'status-pending'}`}>{order.payment ? order.status : 'Payment pending'}</span>
                </Link>)}</div>}
            </section>
            <aside className="admin-panel quick-panel">
              <h2>Quick actions</h2><p>Keep your rental shop up to date.</p>
              <Link className="quick-action" to="/add"><span className="quick-action-icon">＋</span><span><strong>Add a rental item</strong><small>Add pricing, deposit, and product photos</small></span><span aria-hidden="true">→</span></Link>
              <Link className="quick-action" to="/catalog"><span className="quick-action-icon">▦</span><span><strong>Manage catalog</strong><small>Review and update your listings</small></span><span aria-hidden="true">→</span></Link>
              <Link className="quick-action" to="/orders"><span className="quick-action-icon">▤</span><span><strong>View bookings</strong><small>Follow a rental from booking to return</small></span><span aria-hidden="true">→</span></Link>
            </aside>
          </div>
        </>}
    </section>
  )
}

export default Dashboard
