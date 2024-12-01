import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Cart() {
  const [cart, setCart] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if the user is logged in (by checking the token)
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    console.log(token);

    if (token) {
      // Fetch cart from backend if the user is logged in
      axios.get('/api/cart', { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
          // Assuming response.data is an array of cart items
          setCart(response.data);
        })
        .catch(error => {
          console.error('Error fetching cart:', error);
        });
    } else {
      // If the user is not logged in, get the cart from localStorage
      const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCart(savedCart);
    }
  }, []);

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.productId !== productId);
    setCart(updatedCart); // Set updated cart state in UI

    if (isLoggedIn) {
      // If logged in, remove the item from the backend (database)
      axios.post('/api/cart/remove', { productId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(() => {
        // Refresh the cart from the backend after removing the item
        axios.get('/api/cart', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(response => setCart(response.data)) // Update the cart state with the response data
        .catch(error => console.error('Error fetching updated cart:', error));
      })
      .catch(error => console.error('Error removing item from cart:', error));
    } else {
      // If not logged in, remove the item from localStorage (or sessionStorage if preferred)
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
  };

  // Calculate the total price of the cart
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return total + price * quantity;
    }, 0).toFixed(2); // Return total as a fixed-point number
  };

  return (
    <>
      <div>
        <h1>Your Cart</h1>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul>
            {cart.map(item => (
              <li key={item.id}>
                <h2>{item.name}</h2>
                <p>Quantity: {item.quantity}</p>
                <p>Price: ${item.price}</p>
                <button onClick={() => removeFromCart(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
        {/* Display total cost */}
        {cart.length > 0 && <h3>Total: ${calculateTotal()}</h3>}
      </div>
      <Link to="/checkout">Go to Checkout</Link>
    </>
  );
}

export default Cart;
