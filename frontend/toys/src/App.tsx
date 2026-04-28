import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Signup from './pages/Signup'
import Login from './pages/Login'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import CartFAB from './components/CartFAB'
import { CartProvider } from './context/CartContext'

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="app-shell">
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </main>
          <CartFAB />
        </div>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
