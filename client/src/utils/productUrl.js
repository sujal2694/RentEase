export const productSlug = product => {
  const slug = product.name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${slug || 'rental-item'}-${product._id.slice(-6)}`
}

export const productPath = product => `/products/${productSlug(product)}`
