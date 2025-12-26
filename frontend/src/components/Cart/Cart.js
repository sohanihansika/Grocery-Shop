import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart') || '[]'));
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const updateQuantity = (id, qty) => {
    const item = cart.find((i) => i.id === id);
    if (item && qty <= item.quantity && qty > 0) {
      item.quantity = qty;
      setCart([...cart]);
    }
  };

  const removeItem = (id) => {
    setCart(cart.filter((i) => i.id !== id));
  };

  const subtotal = (item) => item.quantity * item.price;
  const total = cart.reduce((sum, item) => sum + subtotal(item), 0);

  const placeOrder = async () => {
    try {
      await api.post('/orders', { items: cart.map((item) => ({ product_id: item.id, quantity: item.quantity })) });
      alert('Order placed!');
      localStorage.removeItem('cart');
      setCart([]);
      navigate('/orders');
    } catch (error) {
      alert('Order failed');
    }
  };

  return (
    <div>
      <h2>Your Cart</h2>
      <table className="table table-responsive">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>${item.price}</td>
              <td>
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  max={item.quantity}  
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  className="form-control w-50"
                />
              </td>
              <td>${subtotal(item)}</td>
              <td><button onClick={() => removeItem(item.id)} className="btn btn-danger">Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Total: ${total}</h3>
      <button onClick={placeOrder} className="btn btn-success" disabled={cart.length === 0}>Confirm Order</button>
      <Link to="/" className="btn btn-secondary ms-2">Continue Shopping</Link>
    </div>
  );
};

export default Cart;