import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminCategoryForm = ({ mode }) => {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');  // Assume string URL
  const navigate = useNavigate();

  useEffect(() => {
    if (mode === 'edit' && id) {
      api.get(`/categories/${id}`).then((res) => {
        setName(res.data.name);
        setDescription(res.data.description);
        setImage(res.data.image || '');
      });
    }
  }, [mode, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { name, description, image };
    try {
      if (mode === 'add') {
        await api.post('/categories', data);
      } else {
        await api.put(`/categories/${id}`, data);
      }
      navigate('/');
    } catch (error) {
      alert('Operation failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" className="form-control mb-3" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <textarea className="form-control mb-3" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      {/* <input type="text" className="form-control mb-3" placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} /> */}
      <button type="submit" className="btn btn-primary">{mode === 'add' ? 'Add' : 'Update'}</button>
    </form>
  );
};

export default AdminCategoryForm;