import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Order.css';  


const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Please log in to view your orders.');
      return;
    }

    axios.get('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        setOrders(response.data || []);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
        setMessage('Failed to load orders.');
      });
  }, []);

  return (
    <div>
      <h1>Your Orders</h1>
      {orders.length > 0 ? (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th>Total</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.status}</td>
                <td>${order.total}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>{message || 'No orders found.'}</p>
      )}
    </div>
  );
};

export default OrdersPage;
