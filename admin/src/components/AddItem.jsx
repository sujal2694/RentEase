import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { DataSkeletons, EmptyState, PageHeader } from './AdminUI'

const initialData = { name: '', description: '', price: '', monthlyRent: '', dailyRent: '', securityDeposit: '', category: '' }

const AddItem = ({ url, token, onApiError }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(initialData)
  const [image, setImage] = useState(null)
  const [currentImage, setCurrentImage] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [isDragging, setIsDragging] = useState(false)

  const loadProduct = useCallback(async signal => {
    if (!id) return
    setLoading(true)
    try {
      const response = await axios.get(`${url}/api/product/list`, { signal })
      if (!response.data.success) throw new Error(response.data.message || 'Unable to load rental item')
      const product = response.data.data.find(item => item._id === id)
      if (!product) throw new Error('Rental item not found')
      setData({
        name: product.name || '',
        description: product.description || '',
        price: product.price ?? '',
        monthlyRent: product.monthlyRent ?? '',
        dailyRent: product.dailyRent ?? '',
        securityDeposit: product.securityDeposit ?? '',
        category: product.category || '',
      })
      setCurrentImage(product.image)
      setLoadError('')
    } catch (error) {
      if (axios.isCancel(error)) return
      console.error('Unable to load rental item for editing', error)
      setLoadError(error.response?.data?.message || error.message || 'Unable to load rental item')
      onApiError(error, 'Unable to load rental item')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [id, url, onApiError])

  useEffect(() => {
    if (!id) return undefined
    const controller = new AbortController()
    loadProduct(controller.signal)
    return () => controller.abort()
  }, [id, loadProduct])

  const [imagePreview, setImagePreview] = useState('')
  useEffect(() => {
    if (!image) {
      setImagePreview(currentImage ? `${url}/images/${currentImage}` : '')
      return undefined
    }
    const previewUrl = URL.createObjectURL(image)
    setImagePreview(previewUrl)
    return () => URL.revokeObjectURL(previewUrl)
  }, [image, currentImage, url])

  const validate = () => {
    const errors = {}
    if (!data.name.trim()) errors.name = 'Enter a product name.'
    if (!data.category.trim()) errors.category = 'Enter a category.'
    if (!String(data.price).trim() || !Number.isFinite(Number(data.price)) || Number(data.price) < 1) errors.price = 'Enter an item value of at least ₹1.'
    if (!String(data.monthlyRent).trim() || !Number.isFinite(Number(data.monthlyRent)) || Number(data.monthlyRent) < 1) errors.monthlyRent = 'Enter monthly rent of at least ₹1.'
    if (!String(data.dailyRent).trim() || !Number.isFinite(Number(data.dailyRent)) || Number(data.dailyRent) < 1) errors.dailyRent = 'Enter daily rent of at least ₹1.'
    if (!String(data.securityDeposit).trim() || !Number.isFinite(Number(data.securityDeposit)) || Number(data.securityDeposit) < 0) errors.securityDeposit = 'Enter a refundable deposit of ₹0 or more.'
    if (!id && !image) errors.image = 'Choose a product photo before saving.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const chooseImage = file => {
    if (!file) return
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setFieldErrors(current => ({ ...current, image: 'Choose a JPEG, PNG, WEBP, or GIF image.' }))
      toast.error('Choose a JPEG, PNG, WEBP, or GIF image')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors(current => ({ ...current, image: 'Choose an image smaller than 5 MB.' }))
      toast.error('Product photo must be smaller than 5 MB')
      return
    }
    setFieldErrors(current => ({ ...current, image: '' }))
    setImage(file)
  }

  const onSubmit = async event => {
    event.preventDefault()
    if (submitting) return
    if (!validate()) {
      toast.error('Check the highlighted fields before saving')
      document.querySelector('[aria-invalid="true"]')?.focus()
      return
    }
    setSubmitting(true)
    try {
      const form = new FormData()
      Object.entries(data).forEach(([key, value]) => form.append(key, value))
      if (id) form.append('id', id)
      if (image) form.append('image', image)
      const response = await axios({
        method: id ? 'put' : 'post',
        url: `${url}/api/product/${id ? 'update' : 'add'}`,
        data: form,
        headers: { token },
      })
      if (!response.data.success) throw new Error(response.data.message || 'Unable to save rental item')
      toast.success(response.data.message || 'Rental item saved')
      navigate('/catalog')
    } catch (error) {
      console.error('Unable to save rental item', error)
      onApiError(error, 'Unable to save rental item')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <DataSkeletons cards={2} />
  if (loadError) return <EmptyState icon="!" title="We couldn’t load this rental item" description={loadError} action={<button className="admin-primary-button" type="button" onClick={() => loadProduct()}>Try again</button>} />

  return (
    <section className="admin-page">
      <PageHeader eyebrow="RENTAL CATALOG" title={id ? 'Edit rental item' : 'Add a rental item'} description="Set clear pricing and product details for your customers." />
      <form className="item-editor" onSubmit={onSubmit}>
        <div className="editor-main">
          <section className="admin-panel editor-section">
            <div className="editor-section-heading"><span className="editor-step">01</span><div><h2>Item details</h2><p>Help customers find the right item for their space.</p></div></div>
            <div className="editor-fields">
              <label className="admin-field field-full"><span>Product name <b className="required-marker" aria-hidden="true">*</b><span className="visually-hidden"> (required)</span></span><input id="product-name" value={data.name} onChange={event => setData(current => ({ ...current, name: event.target.value }))} onBlur={() => setFieldErrors(current => ({ ...current, name: data.name.trim() ? '' : 'Enter a product name.' }))} maxLength={160} placeholder="e.g. 3-seater sofa" required aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? 'product-name-error' : undefined} />{fieldErrors.name && <small className="field-error" id="product-name-error">{fieldErrors.name}</small>}</label>
              <label className="admin-field field-full"><span>Description <small>Optional</small></span><textarea id="product-description" value={data.description} onChange={event => setData(current => ({ ...current, description: event.target.value }))} rows={4} maxLength={1500} placeholder="Describe the product and its key features" /></label>
              <label className="admin-field"><span>Category <b className="required-marker" aria-hidden="true">*</b><span className="visually-hidden"> (required)</span></span><input id="product-category" value={data.category} onChange={event => setData(current => ({ ...current, category: event.target.value }))} onBlur={() => setFieldErrors(current => ({ ...current, category: data.category.trim() ? '' : 'Enter a category.' }))} maxLength={80} placeholder="e.g. Furniture, AC" required aria-invalid={Boolean(fieldErrors.category)} aria-describedby={fieldErrors.category ? 'product-category-error' : undefined} />{fieldErrors.category && <small className="field-error" id="product-category-error">{fieldErrors.category}</small>}</label>
              <label className="admin-field"><span>Item value <b className="required-marker" aria-hidden="true">*</b><small>Replacement value</small><span className="visually-hidden"> (required)</span></span><span className="currency-input"><span aria-hidden="true">₹</span><input id="product-price" type="number" min="1" step="1" value={data.price} onChange={event => setData(current => ({ ...current, price: event.target.value }))} placeholder="25000" required aria-invalid={Boolean(fieldErrors.price)} aria-describedby={fieldErrors.price ? 'product-price-error' : undefined} /></span>{fieldErrors.price && <small className="field-error" id="product-price-error">{fieldErrors.price}</small>}</label>
            </div>
          </section>

          <section className="admin-panel editor-section">
            <div className="editor-section-heading"><span className="editor-step">02</span><div><h2>Rental pricing</h2><p>Show the full rental cost and refundable deposit up front.</p></div></div>
            <div className="editor-fields pricing-fields">
              <label className="admin-field"><span>Monthly rent <b className="required-marker" aria-hidden="true">*</b><small>Per month</small><span className="visually-hidden"> (required)</span></span><span className="currency-input"><span aria-hidden="true">₹</span><input id="product-monthly-rent" type="number" min="1" step="1" value={data.monthlyRent} onChange={event => setData(current => ({ ...current, monthlyRent: event.target.value }))} placeholder="850" required aria-invalid={Boolean(fieldErrors.monthlyRent)} aria-describedby={fieldErrors.monthlyRent ? 'product-monthly-rent-error' : undefined} /></span>{fieldErrors.monthlyRent && <small className="field-error" id="product-monthly-rent-error">{fieldErrors.monthlyRent}</small>}</label>
              <label className="admin-field"><span>Daily rent <b className="required-marker" aria-hidden="true">*</b><small>Per day</small><span className="visually-hidden"> (required)</span></span><span className="currency-input"><span aria-hidden="true">₹</span><input id="product-daily-rent" type="number" min="1" step="1" value={data.dailyRent} onChange={event => setData(current => ({ ...current, dailyRent: event.target.value }))} placeholder="28" required aria-invalid={Boolean(fieldErrors.dailyRent)} aria-describedby={fieldErrors.dailyRent ? 'product-daily-rent-error' : undefined} /></span>{fieldErrors.dailyRent && <small className="field-error" id="product-daily-rent-error">{fieldErrors.dailyRent}</small>}</label>
              <label className="admin-field field-full"><span>Refundable security deposit <b className="required-marker" aria-hidden="true">*</b><small>Returned after rental</small><span className="visually-hidden"> (required)</span></span><span className="currency-input"><span aria-hidden="true">₹</span><input id="product-deposit" type="number" min="0" step="1" value={data.securityDeposit} onChange={event => setData(current => ({ ...current, securityDeposit: event.target.value }))} placeholder="2550" required aria-invalid={Boolean(fieldErrors.securityDeposit)} aria-describedby={fieldErrors.securityDeposit ? 'product-deposit-error' : 'product-deposit-hint'} /></span>{fieldErrors.securityDeposit && <small className="field-error" id="product-deposit-error">{fieldErrors.securityDeposit}</small>}<small className="field-hint" id="product-deposit-hint">Refunded after the rental is returned in good condition.</small></label>
            </div>
          </section>
        </div>

        <aside className="editor-aside">
          <section className="admin-panel image-panel">
            <div className="editor-section-heading"><span className="editor-step">03</span><div><h2>Product photo <b className="required-marker" aria-hidden="true">*</b></h2><p>JPEG, PNG, WEBP, or GIF. Up to 5 MB.</p></div></div>
            <label className={`image-dropzone${isDragging ? ' is-dragging' : ''}`} htmlFor="rental-image" onDragOver={event => { event.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={event => { event.preventDefault(); setIsDragging(false); chooseImage(event.dataTransfer.files?.[0]) }}>
              {imagePreview ? <><img src={imagePreview} alt={`${data.name || 'Rental item'} image preview`} /><span className="image-preview-hint">Drop or choose to replace</span></> : <><span className="image-upload-icon">↑</span><strong>Choose or drop a photo</strong><small>JPEG, PNG, WEBP or GIF · up to 5 MB</small></>}
            </label>
            <input className="visually-hidden" id="rental-image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={event => { chooseImage(event.target.files?.[0] || null); event.currentTarget.value = '' }} aria-required="true" aria-invalid={Boolean(fieldErrors.image)} aria-describedby={fieldErrors.image ? 'product-image-error' : undefined} />
            {fieldErrors.image && <small className="field-error" id="product-image-error" role="alert">{fieldErrors.image}</small>}
            <label className="image-select-button" htmlFor="rental-image" tabIndex="0" onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); document.getElementById('rental-image')?.click() } }}>{image ? 'Change photo' : id ? 'Replace photo' : 'Upload photo'}</label>
          </section>
          <section className="editor-note"><span aria-hidden="true">✦</span><p>Clear product photos and transparent rental pricing help customers book with confidence.</p></section>
          <div className="editor-actions"><button className="admin-secondary-button" type="button" onClick={() => navigate('/catalog')}>Cancel</button><button className="admin-primary-button" type="submit" disabled={submitting}>{submitting ? 'Saving…' : id ? 'Save changes' : 'Add rental item'}</button></div>
        </aside>
      </form>
    </section>
  )
}

export default AddItem
