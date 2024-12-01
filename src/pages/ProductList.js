import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/ProductList.css';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  // Check if the user is logged in by checking the token
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Fetch products from the API
    axios.get('/api/products')
      .then(response => {
        setProducts(response.data);
        setLoading(false); // Stop the loading spinner once products are fetched
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setLoading(false); // Stop loading even in case of error
      });

    // Update cart count on page load
    updateCartCount();
  }, []);

  // Function to update the cart item count
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    setCartItemsCount(totalItems);
  };

  // Add to cart function for both logged in and guest users
  const addToCart = (product) => {
    if (isLoggedIn) {
      // If logged in, send request to backend to add product to cart
      const data = { productId: product.id, quantity: 1 };
      axios.post('/api/cart/add', data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(() => {
           updateCartCount(); // Update cart count after adding to cart
        })
        .catch(error => {
          console.error('Error adding product to cart:', error);
        });
    } else {
      // If not logged in, add product to localStorage cart
      const cart = JSON.parse(localStorage.getItem('cart')) || [];

      // Check if the product already exists in the cart
      const existingProductIndex = cart.findIndex(item => item.id === product.id);
      if (existingProductIndex >= 0) {
        // If the product exists, update the quantity
        cart[existingProductIndex].quantity += 1;
      } else {
        // If the product doesn't exist, add it to the cart with quantity 1
        cart.push({ ...product, quantity: 1 });
      }

      // Save updated cart to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
      alert('Product added to cart');
      updateCartCount(); // Update cart count after adding to cart
    }
  };

  // Loading spinner UI
  const loadingSpinner = (
    <div className="loading">
      <span>Loading...</span>
    </div>
  );

  return (
    <div className="product-list-container">
      
      

      {/* Loading Spinner */}
      {loading && loadingSpinner}

      {/* Product Grid */}
      <div className="product-grid">
        {!loading && products.map((product) => (
          <div key={product.id} className="product-card">
            <img 
              src={`http://localhost:81/public/uploads/images/${product.image}`} 
              alt={product.name} 
              className="product-image" 
            />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p className="product-price">Price: ${product.price}</p>
            <Link to={`/product/${product.id}`} className="view-details">View Details</Link>
            <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
