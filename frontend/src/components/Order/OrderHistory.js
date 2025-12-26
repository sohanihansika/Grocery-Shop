import { useState, useEffect } from 'react';
import api from '../../services/api';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders').then((res) => setOrders(res.data));
  }, []);

  const [productsMap, setProductsMap] = useState({});

  useEffect(() => {
    const ids = Array.from(new Set(
      orders.flatMap(o => o.items.map(i => i.product_id ?? i.productId))
    )).filter(Boolean);

    if (ids.length === 0) return;

    const fetchNames = async () => {
      try {
        // Try a batch endpoint that accepts a comma separated list of ids
        const res = await api.get('/products', { params: { ids: ids.join(',') } });
        const map = {};
        res.data.forEach(p => { map[p.id] = p.name; });
        setProductsMap(prev => ({ ...prev, ...map }));
      } catch (err) {
        // Fallback: fetch each product individually
        const promises = ids.map(id =>
          api.get(`/products/${id}`).then(r => r.data).catch(() => null)
        );
        const products = await Promise.all(promises);
        const map = {};
        products.forEach(p => { if (p) map[p.id] = p.name; });
        setProductsMap(prev => ({ ...prev, ...map }));
      }
    };

    fetchNames();
  }, [orders]);

  return (
    <div>
      <h2>Order History</h2>
      {orders.map((order) => (
        <div key={order.id} className="card mb-3">
          <div className="card-body">
            <h5>Order #{order.id} - Total: ${order.total} - Status: {order.status}</h5>
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => {
                  const productId = item.product_id ?? item.productId;
                  const nameFromMap = productsMap[productId];
                  return (
                    <tr key={item.id}>
                      <td>{item.name ?? nameFromMap ?? 'Loading...'}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price_at_purchase}</td>
                      <td>${item.quantity * item.price_at_purchase}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;