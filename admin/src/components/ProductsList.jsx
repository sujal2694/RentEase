import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { DataSkeletons, EmptyState, Modal, PageHeader } from './AdminUI'

const categoryName = value => String(value || '').toLowerCase().split(/[_\s-]+/).filter(Boolean).map(word => word[0].toUpperCase() + word.slice(1)).join(' ')
const pageSize = 12
const createdTime = product => {
  const date = Date.parse(product.createdAt)
  if (Number.isFinite(date)) return date
  const objectIdPrefix = String(product._id || '').slice(0, 8)
  return /^[\da-f]{8}$/i.test(objectIdPrefix) ? Number.parseInt(objectIdPrefix, 16) * 1000 : 0
}

const ProductsList = ({ url, token, onApiError }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('newest')
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const [refreshing, setRefreshing] = useState(false)
  const [productToRemove, setProductToRemove] = useState(null)
  const [removing, setRemoving] = useState(false)
  const [imageReady, setImageReady] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 250)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const fetchProducts = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    else setRefreshing(true)
    try {
      const response = await axios.get(`${url}/api/product/list`)
      if (!response.data.success) throw new Error(response.data.message || 'Unable to load rental catalog')
      setProducts(response.data.data)
      setError('')
    } catch (error) {
      console.error('Unable to load rental catalog', error)
      setError(error.response?.data?.message || error.message || 'Unable to load rental catalog')
      onApiError(error, 'Unable to load rental catalog')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [url, onApiError])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const categories = useMemo(() => [...new Set(products.map(product => product.category).filter(Boolean))].sort(), [products])
  const filteredProducts = useMemo(() => products.filter(product => {
    const matchesCategory = category === 'all' || product.category === category
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || `${product.name} ${product.category} ${product.description || ''}`.toLowerCase().includes(query)
    return matchesCategory && matchesSearch
  }).sort((first, second) => {
    if (sort === 'price-low') return (Number(first.monthlyRent) || 0) - (Number(second.monthlyRent) || 0)
    if (sort === 'price-high') return (Number(second.monthlyRent) || 0) - (Number(first.monthlyRent) || 0)
    if (sort === 'name') return first.name.localeCompare(second.name)
    return createdTime(second) - createdTime(first)
  }), [products, category, search, sort])

  useEffect(() => { setVisibleCount(pageSize) }, [search, category, sort])

  const removeProduct = async () => {
    const product = productToRemove
    if (!product) return
    setRemoving(true)
    try {
      const response = await axios.post(`${url}/api/product/remove`, { id: product._id }, { headers: { token } })
      if (!response.data.success) throw new Error(response.data.message || 'Unable to remove rental item')
      setProducts(current => current.filter(item => item._id !== product._id))
      toast.success('Rental item removed')
      setProductToRemove(null)
    } catch (error) {
      console.error('Unable to remove rental item', error)
      onApiError(error, 'Unable to remove rental item')
    } finally {
      setRemoving(false)
    }
  }
  const closeRemoveDialog = useCallback(() => setProductToRemove(null), [])

  return (
    <section className="admin-page">
      <PageHeader eyebrow="YOUR RENTAL COLLECTION" title="Rental catalog" description="Manage products, rental rates, and refundable deposits." action={<Link className="admin-primary-button heading-action" to="/add"><span aria-hidden="true">＋</span> Add rental item</Link>} />
      {error && products.length > 0 && <div className="admin-error-banner" role="status"><span>{error}</span><button type="button" onClick={() => fetchProducts(true)} disabled={refreshing}>Retry</button></div>}

      <div className="catalog-toolbar">
        <label className="catalog-search"><span aria-hidden="true">⌕</span><input type="search" value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder="Search items or categories" aria-label="Search rental catalog" /></label>
        <label className="category-filter"><span>Category</span><select value={category} onChange={event => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map(value => <option key={value} value={value}>{categoryName(value)}</option>)}</select></label>
        <label className="category-filter sort-filter"><span>Sort</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="newest">Newest</option><option value="name">Name A–Z</option><option value="price-low">Monthly rent: low to high</option><option value="price-high">Monthly rent: high to low</option></select></label>
        <button className="admin-secondary-button refresh-button" type="button" onClick={() => fetchProducts(true)} disabled={refreshing}>{refreshing ? 'Refreshing…' : '↻ Refresh'}</button>
        <span className="catalog-count">{filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}</span>
      </div>

      {loading ? <DataSkeletons cards={6} />
        : error && !products.length ? <EmptyState icon="!" title="We couldn’t load the rental catalog" description={error} action={<button className="admin-primary-button" type="button" onClick={() => fetchProducts()}>Try again</button>} />
        : filteredProducts.length === 0
          ? <EmptyState icon="▦" title={products.length ? 'No matching rentals' : 'No rentals in the catalog yet'} description={products.length ? 'Try a different search or category.' : 'Use “Add rental item” to create your first listing.'} />
          : <><div className="catalog-grid">{filteredProducts.slice(0, visibleCount).map(product => (
            <article className="catalog-card" key={product._id}>
              <div className={`catalog-card-image${imageReady[product._id] ? ' image-is-ready' : ''}`}><span className="catalog-image-placeholder" aria-hidden="true">▦</span><img src={`${url}/images/${product.image}`} alt={product.name} loading="lazy" width="640" height="480" onLoad={() => setImageReady(current => ({ ...current, [product._id]: true }))} onError={event => { event.currentTarget.hidden = true }} /><span className="catalog-category">{categoryName(product.category)}</span></div>
              <div className="catalog-card-body">
                <div className="catalog-card-title"><h2 title={product.name}>{product.name}</h2><p>{product.description || 'No item description added.'}</p></div>
                <div className="catalog-price-row"><span><strong>₹{Number(product.monthlyRent).toLocaleString('en-IN')}</strong><small>/ month</small></span><span><strong>₹{Number(product.dailyRent).toLocaleString('en-IN')}</strong><small>/ day</small></span></div>
                <p className="catalog-deposit">Refundable deposit <strong>₹{Number(product.securityDeposit).toLocaleString('en-IN')}</strong></p>
                <div className="catalog-card-actions"><button className="admin-secondary-button" type="button" onClick={() => navigate(`/edit/${product._id}`)}>Edit item</button><button className="remove-button" type="button" aria-label={`Remove ${product.name}`} onClick={() => setProductToRemove(product)}>Remove</button></div>
              </div>
            </article>))}
          </div>{visibleCount < filteredProducts.length && <button className="admin-secondary-button load-more-button" type="button" onClick={() => setVisibleCount(count => count + pageSize)}>Load more rentals</button>}</>}
      {productToRemove && <Modal title="Remove this item?" description="This cannot be undone. The item will be removed from your rental catalog. Existing booking records will be kept." onClose={closeRemoveDialog}><p className="modal-item-name">{productToRemove.name}</p><div className="modal-actions"><button className="admin-secondary-button" type="button" onClick={closeRemoveDialog} disabled={removing}>Keep item</button><button className="modal-destructive-button" type="button" onClick={removeProduct} disabled={removing}>{removing ? 'Removing…' : 'Remove item'}</button></div></Modal>}
    </section>
  )
}

export default ProductsList
