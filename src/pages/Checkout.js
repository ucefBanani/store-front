import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function Checkout() {
  const [cart, setCart] = useState([]); // Initialize cart as an empty array
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch the cart items from the backend
      axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          console.log('Fetched cart data:', response.data); // Log the data to verify
          setCart(response.data || []); // Ensure cart is set to an empty array if not provided
        })
        .catch(error => {
          console.error('Error fetching cart:', error);
          setMessage('Failed to load cart.');
        });
    } else {
      setMessage('Please log in to view your cart.');
    }
  }, []);

  // Calculate the total price of the cart
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 0;
      return total + price * quantity;
    }, 0).toFixed(2); // Return total as a fixed-point number
  };

  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to complete your order.');
      return;
    }

    const items = cart.map(item => ({
      productId: item.product?.id, // Ensure item.product is defined before accessing id
      quantity: item.quantity
    }));

    // Create order
    axios.post('/api/orders', { items }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        const { id, client_secret } = response.data;

        console.log(id, client_secret);
        
        // Store the client_secret for the payment page
        localStorage.setItem('client_secret', client_secret);
        // Redirect to payment page using navigate
        navigate(`/payment/${id}`); // Navigate to the payment page with the order id
      })
      .catch(error => {
        console.error('Error creating order:', error);
        setMessage('Failed to place order.');
      });
  };

  return (
    <div>
      <h1>Checkout</h1>
      {cart.length > 0 ? (
        <>
          {cart.map((item, index) => (
            <div key={index}>
              <h2>{item.product?.name}</h2> {/* Assuming product has a 'name' field */}
              <p>Price: ${item.product?.price}</p>
              <p>Quantity: {item.quantity}</p>
            </div>
          ))}
          {/* Display total cost */}
          <h3>Total: ${calculateTotal()}</h3>
        </>
      ) : (
        <p>{message || 'Your cart is empty.'}</p>
      )}
      <button onClick={handleCheckout}>Place Order</button>
    </div>
  );
}

export default Checkout;
