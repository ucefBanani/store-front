import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './pages/Navbar';
import ProductList from './pages/ProductList';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import PaymentPage from './Component/PaymentPage';
import OrdersPage from './pages/OrdersPage';

import { loadStripe } from '@stripe/stripe-js';

 
 
function App() {
  const handleLoginSuccess = () => {
    window.location.href = '/'; // Redirect to cart after login
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/user/order" element={<OrdersPage />} />
         <Route path="/payment/:id" element={<PaymentPage />} />
         <Route path="/orders" element={<OrdersPage />} /> {/* Add OrdersPage route */}

        
      </Routes>
    </Router>
  );
}

export default App;
