import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminProductForm = ({ mode }) => {
  const { id, categoryId } = useParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [productCategoryId, setProductCategoryId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (mode === 'edit' && id) {
      api.get(`/products/${id}`).then((res) => {
        setName(res.data.name);
        setDescription(res.data.description);
        setPrice(res.data.price);
        setQuantity(res.data.quantity);
        setProductCategoryId(res.data.category_id ?? null);
      });
    }
  }, [mode, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // For 'add' mode the URL param `categoryId` indicates the parent category.
    // For 'edit' mode we must preserve the product's existing category_id (loaded above)
    const category_id = mode === 'add' ? parseInt(categoryId) : productCategoryId;
    const data = { name, description, price: parseFloat(price), quantity: parseInt(quantity), category_id: parseInt(category_id) };
    try {
      if (mode === 'add') {
        await api.post('/products', data);
      } else {
        await api.put(`/products/${id}`, data);
      }
      navigate(`/products/${categoryId || data.category_id}`);
    } catch (error) {
      alert('Operation failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" className="form-control mb-3" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <textarea className="form-control mb-3" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input type="number" className="form-control mb-3" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
      <input type="number" className="form-control mb-3" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
      <button type="submit" className="btn btn-primary">{mode === 'add' ? 'Add' : 'Update'}</button>
    </form>
  );
};

export default AdminProductForm;