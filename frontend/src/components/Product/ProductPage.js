import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

const ProductPage = ({ isAdmin }) => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart') || '[]'));
  const [quantityInputs, setQuantityInputs] = useState({});
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    api.get('/products').then((res) => {
      const filtered = res.data.filter((prod) => prod.category_id == categoryId);  // Filter client-side
      setProducts(filtered);
    }).catch((err) => console.error(err));
  }, [categoryId]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    // fetch category name for display
    api.get(`/categories/${categoryId}`).then((res) => {
      setCategoryName(res.data.name || '');
    }).catch((err) => console.error(err));
  }, [categoryId]);

  const filteredProducts = products.filter((prod) => prod.name.toLowerCase().includes(search.toLowerCase()));

  const handleAddToCart = (prod) => {
    const qty = quantityInputs[prod.id] || 1;
    if (qty > prod.quantity || qty <= 0) {
      alert('Invalid quantity');
      return;
    }
    const existing = cart.find((item) => item.id === prod.id);
    if (existing) {
      existing.quantity += qty;
      setCart([...cart]);
    } else {
      setCart([...cart, { ...prod, quantity: qty }]);
    }
    setQuantityInputs({ ...quantityInputs, [prod.id]: 1 });
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Delete product?')) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter((p) => p.id !== id));
      } catch (error) {
        alert('Delete failed');
      }
    }
  };

  return (
    <div>
  <h2>{categoryName} Products</h2>
      <div className="d-flex justify-content-between mb-3">
        <input type="text" className="form-control w-50" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        {isAdmin && <Link to={`/admin/products/add/${categoryId}`} className="btn btn-success">Add Product</Link>}
      </div>
      <table className="table table-responsive">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Enter Count</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((prod) => (
            <tr key={prod.id}>
              <td>{prod.name}</td>
              <td>{prod.description}</td>
              <td>{prod.quantity}</td>
              <td>${prod.price}</td>
              <td>
                {!isAdmin ? (
                  <>
                    <input
                      type="number"
                      min="1"
                      max={prod.quantity}
                      value={quantityInputs[prod.id] || 1}
                      onChange={(e) => setQuantityInputs({ ...quantityInputs, [prod.id]: parseInt(e.target.value) || 1 })}
                      className="form-control d-inline w-50 me-2"
                    />
                    <button onClick={() => handleAddToCart(prod)} className="btn btn-primary">Add to Cart</button>
                  </>
                ) : (
                  <>
                    <Link to={`/admin/products/edit/${prod.id}`} className="btn btn-warning me-2">Edit</Link>
                    <button onClick={() => handleDeleteProduct(prod.id)} className="btn btn-danger">Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!isAdmin && <p>Selected items added to cart. <Link to="/cart">View Cart</Link></p>}
      <Link to="/" className="btn btn-secondary">Back to Home</Link>
    </div>
  );
};

export default ProductPage;