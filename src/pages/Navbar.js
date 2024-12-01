import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css'; // Importing the CSS file for styling
import axios from 'axios'; // Import axios to fetch cart data if user is logged in

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [cartItemsCount, setCartItemsCount] = useState(0); // State to store the number of items in the cart

  // Function to update the cart item count based on localStorage or the backend
  const updateCartCount = () => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch cart from backend if user is logged in
      axios.get('/api/cart', { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          // Calculate total quantity of items
          const itemCount = response.data.reduce((total, item) => total + item.quantity, 0);
          setCartItemsCount(itemCount);
        })
        .catch(error => {
          console.error('Error fetching cart:', error);
        });
    } else {
      // If user is not logged in, check localStorage for the cart
      const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
      const itemCount = savedCart.reduce((total, item) => total + item.quantity, 0); // Calculate total quantity of items
      setCartItemsCount(itemCount);
    }
  };

  // Update cart count whenever the component mounts or when login status changes
  useEffect(() => {
    updateCartCount();
  }, [isLoggedIn]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    alert('Logged out successfully');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="logo">my-shop</Link> {/* You can add your app's logo here */}
      </div>
      <div className="navbar-links">
        <Link to="/cart" className="navbar-link">
          Cart {cartItemsCount > 0 && `(${cartItemsCount})`} {/* Display number of items if more than 0 */}
        </Link>
        <Link to="/" className="navbar-link">Home</Link>
        {isLoggedIn ? (
          <>
            <Link to="/orders" className="navbar-link">Orders</Link> {/* Show Orders button when logged in */}
            <button onClick={handleLogout} className="navbar-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/register" className="navbar-link navbar-btn">Register</Link> {/* New Register link */}
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
