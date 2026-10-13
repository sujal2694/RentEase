import React, { Suspense, lazy, useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar/Navbar'
import SeoMetadata from './components/SeoMetadata'
import Footer from './components/Footer/Footer'
import { StoreContext } from './context/StoreContext'

const LoginPage = lazy(() => import('./components/Loginpage/LoginPage'))
const Home = lazy(() => import('./Pages/Home/Home'))
const ProductPage = lazy(() => import('./Pages/ProductPage/ProductPage'))
const About = lazy(() => import('./Pages/About/About'))
const Contact = lazy(() => import('./Pages/Contact/Contact'))
const Cart = lazy(() => import('./Pages/Cart/Cart'))
const PlaceOrder = lazy(() => import('./Pages/PlaceOrder/PlaceOrder'))
const Myorders = lazy(() => import('./Pages/Myorders/Myorders'))
const Verify = lazy(() => import('./Pages/Verify/Verify'))
const SearchBar = lazy(() => import('./Pages/SearchBar/SearchBar'))
const Product = lazy(() => import('./Pages/Product/Product'))

const App = () => {
  const { loginPopUp } = useContext(StoreContext)
  return (
    <div>
      <SeoMetadata />
      <Suspense fallback={<main className="route-loading" aria-live="polite">Loading RentEase…</main>}>
        {loginPopUp ? <LoginPage /> : null}
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/products' element={<ProductPage />} />
          <Route path='/products/:slug' element={<Product />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/placeorder' element={<PlaceOrder />} />
          <Route path='/myorders' element={<Myorders />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/product/:id' element={<Product />} />
        </Routes>
        <SearchBar />
        <Footer />
      </Suspense>
      <Toaster />
    </div>
  )
}

export default App
