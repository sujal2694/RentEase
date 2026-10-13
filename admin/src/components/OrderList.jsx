import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Badge, DataSkeletons, EmptyState, PageHeader, Select } from './AdminUI'

const bookingStatuses = ['Booked', 'Out for delivery', 'Active', 'Returned', 'Cancelled']
const nextStatuses = {
  'Booked': ['Out for delivery', 'Cancelled'],
  'Out for delivery': ['Active', 'Cancelled'],
  'Active': ['Returned'],
  'Returned': [],
  'Cancelled': [],
}
const statusClass = status => `status-${String(status || 'pending').toLowerCase().replaceAll(' ', '-')}`
const numberOrNull = value => Number.isFinite(Number(value)) ? Number(value) : null
const money = value => {
  const amount = numberOrNull(value)
  return amount === null || amount < 0 ? null : `₹${amount.toLocaleString('en-IN')}`
}
const rentalDuration = item => {
  const value = Number(item.rentalMonths)
  const months = Number.isInteger(value) && value > 0 ? value : 1
  return `${months} month${months === 1 ? '' : 's'}`
}
const formatDate = value => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const OrderList = ({ url, token, onApiError }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchOrders = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    else setRefreshing(true)
    try {
      const response = await axios.get(`${url}/api/order/list`, { headers: { token } })
      if (!response.data.success) throw new Error(response.data.message || 'Unable to load bookings')
      setOrders(response.data.data)
      setError('')
    } catch (error) {
      console.error('Unable to load rental bookings', error)
      setError(error.response?.data?.message || error.message || 'Unable to load rental bookings')
      onApiError(error, 'Unable to load rental bookings')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [url, token, onApiError])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const filteredOrders = useMemo(() => orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'Payment pending' ? !order.payment : statusFilter === 'Needs review' ? [order.amount, order.rentalSubtotal, order.depositAmount].some(value => money(value) === null) : order.status === statusFilter)
    const customerName = `${order.address?.firstname || ''} ${order.address?.lastname || ''}`
    const itemNames = (order.items || []).map(item => item.name).join(' ')
    const text = `${customerName} ${order.address?.email || ''} ${order._id} ${itemNames}`.toLowerCase()
    return matchesStatus && (!query.trim() || text.includes(query.trim().toLowerCase()))
  }), [orders, statusFilter, query])

  const changeStatus = async (orderId, status) => {
    const previousStatus = orders.find(order => order._id === orderId)?.status
    setOrders(current => current.map(order => order._id === orderId ? { ...order, status } : order))
    try {
      const response = await axios.put(`${url}/api/order/status`, { orderId, status }, { headers: { token } })
      if (!response.data.success) throw new Error(response.data.message || 'Unable to update booking')
      toast.success('Booking status updated')
    } catch (error) {
      setOrders(current => current.map(order => order._id === orderId ? { ...order, status: previousStatus } : order))
      console.error('Unable to update rental booking status', error)
      onApiError(error, 'Unable to update booking')
    }
  }

  const paidCount = orders.filter(order => order.payment).length

  return (
    <section className="admin-page">
      <PageHeader eyebrow="CUSTOMER RENTALS" title="Bookings" description="Track every rental from payment through delivery and return." action={<button className="admin-secondary-button heading-action" type="button" onClick={() => fetchOrders(true)} disabled={refreshing}>{refreshing ? 'Refreshing…' : '↻ Refresh'}</button>} />
      {error && orders.length > 0 && <div className="admin-error-banner" role="status"><span>{error}</span><button type="button" onClick={() => fetchOrders(true)} disabled={refreshing}>Retry</button></div>}
      <div className="booking-summary-strip"><div><strong>{orders.length}</strong><span>Total bookings</span></div><div><strong>{paidCount}</strong><span>Paid bookings</span></div><div><strong>{orders.length - paidCount}</strong><span>Awaiting payment</span></div></div>
      <div className="booking-toolbar">
        <label className="catalog-search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search customer, booking, or item" aria-label="Search bookings" /></label>
        <Select id="booking-status-filter" label="Status" className="category-filter" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option value="all">All bookings</option><option value="Payment pending">Payment pending</option><option value="Needs review">Needs review</option>{bookingStatuses.map(status => <option key={status} value={status}>{status}</option>)}</Select>
        <span className="catalog-count">{filteredOrders.length} shown</span>
      </div>

      {loading ? <DataSkeletons cards={3} /> : error && !orders.length
        ? <EmptyState icon="!" title="We couldn’t load bookings" description={error} action={<button className="admin-primary-button" type="button" onClick={() => fetchOrders()}>Try again</button>} />
        : filteredOrders.length === 0
          ? <EmptyState icon="▤" title={orders.length ? 'No matching bookings' : 'No bookings yet'} description={orders.length ? 'Try a different name, item, or status.' : 'Customer rental bookings will appear here.'} action={orders.length > 0 ? <button className="admin-secondary-button" type="button" onClick={() => { setQuery(''); setStatusFilter('all') }}>Clear filters</button> : null} />
        : <div className="booking-list">{filteredOrders.map(order => {
          const address = order.address || {}
          const terminal = ['Returned', 'Cancelled'].includes(order.status)
          return <article className="booking-card" key={order._id}>
            <div className="booking-card-header">
              <div className="booking-id-group"><span className="booking-id-mark" aria-hidden="true">R</span><div><strong>Booking #{order._id.slice(-8).toUpperCase()}</strong><small><time dateTime={order.date}>{formatDate(order.date)}</time></small></div></div>
              <div className="booking-status-group"><Badge className={order.payment ? statusClass(order.status) : 'status-pending'}>{order.payment ? order.status : 'Payment pending'}</Badge><Badge className={order.payment ? 'status-paid' : 'status-unpaid'}>{order.payment ? 'Paid' : 'Unpaid'}</Badge></div>
            </div>
            <div className="booking-card-content">
              <section className="booking-customer"><h3>Customer & delivery</h3><strong>{address.firstname} {address.lastname}</strong><a href={`mailto:${address.email}`}>{address.email}</a><a href={`tel:${address.phone}`}>{address.phone}</a><p>{[address.street, address.city, address.state, address.pinCode].filter(Boolean).join(', ')}</p></section>
              <section className="booking-items" aria-label="Rental items"><h3>Rental items</h3>{(order.items || []).map((item, index) => <div className="booking-item" key={`${item.productId}-${index}`}><span><strong>{item.name}</strong><small>{Number(item.quantity || 1)} item{Number(item.quantity || 1) === 1 ? '' : 's'} · {rentalDuration(item)} · ₹{Math.max(0, Number(item.monthlyRent) || 0).toLocaleString('en-IN')}/month</small></span><strong>{money(item.rentalAmount) || 'Needs review'}</strong></div>)}</section>
              <section className="booking-totals" aria-label="Payment summary"><h3>Payment summary</h3><div><span>Rental charges</span><strong>{money(order.rentalSubtotal) || 'Needs review'}</strong></div><div><span>Refundable deposit</span><strong>{money(order.depositAmount) || 'Needs review'}</strong></div><div><span>Due today</span><strong>{money(order.amount) || 'Needs review'}</strong></div><p>{[order.amount, order.rentalSubtotal, order.depositAmount].some(value => money(value) === null) ? 'This booking total needs review. No amount has been altered.' : order.payment ? 'Payment received' : 'Customer has not completed payment'}</p></section>
            </div>
            <div className="booking-card-footer"><span>{order.payment ? 'Update rental progress' : 'Status updates are available after payment.'}</span>{order.payment && <label className="booking-status-select"><span className="visually-hidden">Booking status</span><select value={order.status} disabled={terminal} onChange={event => changeStatus(order._id, event.target.value)}>{[order.status, ...(nextStatuses[order.status] || [])].map(status => <option key={status} value={status}>{status}</option>)}</select></label>}</div>
          </article>
        })}</div>}
    </section>
  )
}

export default OrderList
