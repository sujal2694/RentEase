import { useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { StoreContext } from '../context/StoreContext'
import { productPath } from '../utils/productUrl'

const routeMetadata = {
  '/': ['Furniture & Appliance Rentals | RentEase', 'Rent quality furniture and appliances with flexible terms, transparent rental pricing, and refundable security deposits.'],
  '/about': ['About RentEase | Furniture & Appliance Rentals', 'Learn how RentEase makes renting furniture and appliances simple, flexible, and transparent.'],
  '/contact': ['Contact RentEase | Rental Support', 'Contact RentEase for help choosing, booking, or managing a furniture and appliance rental.'],
  '/products': ['Furniture & Appliance Rentals | RentEase', 'Explore furniture and appliances for rent with daily and monthly prices, flexible terms, and refundable deposits.'],
  '/cart': ['Rental Basket | RentEase', 'Review rental items, rental periods, charges, and refundable deposits in your RentEase basket.'],
  '/placeorder': ['Complete Your Rental Booking | RentEase', 'Enter delivery details and confirm your RentEase rental booking.'],
  '/myorders': ['My Rentals | RentEase', 'View your RentEase bookings, rental durations, and delivery status.'],
  '/verify': ['Confirming Your Rental | RentEase', 'Your RentEase rental payment and booking confirmation.'],
}

const metadataContent = (selector, attribute, key, value) => {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', value)
}

const SeoMetadata = () => {
  const { pathname } = useLocation()
  const { productsList, url } = useContext(StoreContext)
  const slug = pathname.startsWith('/products/') ? pathname.slice('/products/'.length) : ''
  const id = pathname.startsWith('/product/') ? pathname.slice('/product/'.length) : ''
  const cleanProductUrl = Boolean(slug)
  const legacyProductId = Boolean(id)
  const product = cleanProductUrl
    ? productsList.find(item => productPath(item) === pathname)
    : legacyProductId
      ? productsList.find(item => item._id === id)
      : null

  useEffect(() => {
    const origin = (import.meta.env.VITE_SITE_URL || 'http://localhost:5174').replace(/\/+$/, '')
    const isProduct = pathname.startsWith('/product/') || pathname.startsWith('/products/')
    const productPathname = product ? productPath(product) : pathname
    const [title, description] = product
      ? [`${product.name} Rental | RentEase`, `Rent ${product.name} with transparent daily and monthly pricing, a flexible rental term, and a refundable security deposit.`]
      : isProduct
        ? ['Rental item | RentEase', 'Explore flexible furniture and appliance rental terms with RentEase.']
        : routeMetadata[pathname] || ['RentEase | Furniture & Appliance Rentals', 'Rent quality furniture and appliances with flexible terms and transparent pricing.']
    const canonical = `${origin}${productPathname}`
    document.title = title
    metadataContent('meta[name="description"]', 'name', 'description', description)
    const privateRoute = ['/cart', '/placeorder', '/myorders', '/verify'].includes(pathname)
    metadataContent('meta[name="robots"]', 'name', 'robots', privateRoute ? 'noindex, nofollow' : 'index, follow')
    metadataContent('meta[property="og:type"]', 'property', 'og:type', product ? 'product' : 'website')
    metadataContent('meta[property="og:title"]', 'property', 'og:title', title)
    metadataContent('meta[property="og:description"]', 'property', 'og:description', description)
    metadataContent('meta[property="og:url"]', 'property', 'og:url', canonical)
    metadataContent('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    metadataContent('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    metadataContent('meta[name="twitter:description"]', 'name', 'twitter:description', description)

    let canonicalElement = document.head.querySelector('link[rel="canonical"]')
    if (!canonicalElement) {
      canonicalElement = document.createElement('link')
      canonicalElement.rel = 'canonical'
      document.head.appendChild(canonicalElement)
    }
    canonicalElement.href = canonical

    let imageMeta = document.head.querySelector('meta[property="og:image"]')
    if (product) {
      const imageUrl = `${url}/images/${product.image}`
      if (!imageMeta) {
        imageMeta = document.createElement('meta')
        imageMeta.setAttribute('property', 'og:image')
        document.head.appendChild(imageMeta)
      }
      imageMeta.content = imageUrl
      metadataContent('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl)
    } else {
      imageMeta?.remove()
      document.head.querySelector('meta[name="twitter:image"]')?.remove()
    }

    const existingStructuredData = document.head.querySelector('#rentease-product-structured-data')
    existingStructuredData?.remove()
    if (product) {
      const structuredData = document.createElement('script')
      structuredData.id = 'rentease-product-structured-data'
      structuredData.type = 'application/ld+json'
      structuredData.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description || description,
        image: `${url}/images/${product.image}`,
        category: product.category,
        offers: {
          '@type': 'Offer',
          url: canonical,
          priceCurrency: 'INR',
          price: Math.max(0, Number(product.monthlyRent) || 0),
          availability: 'https://schema.org/InStock',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            priceCurrency: 'INR',
            price: Math.max(0, Number(product.monthlyRent) || 0),
            unitText: 'MONTH',
          },
        },
      })
      document.head.appendChild(structuredData)
    }
  }, [pathname, product, productsList, url, id, slug])

  return null
}

export default SeoMetadata
