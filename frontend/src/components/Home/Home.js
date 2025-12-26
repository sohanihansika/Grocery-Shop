import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Home = ({ isAdmin }) => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch((err) => console.error(err));
  }, []);

  const filteredCategories = categories.filter((cat) => cat.name.toLowerCase().includes(search.toLowerCase()));

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Delete category?')) {
      try {
        await api.delete(`/categories/${id}`);
        setCategories(categories.filter((c) => c.id !== id));
      } catch (error) {
        alert('Delete failed');
      }
    }
  };

  return (
    <div>
      <h1 className="text-center">GROCERY SHOP</h1>
      <p className="text-center">Browse categories or search for your favorites</p>
      <div className="d-flex justify-content-center mb-4">
        <input type="text" className="form-control w-50" placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {isAdmin && <Link to="/admin/categories/add" className="btn btn-success mb-3">Add Category</Link>}
      <div className="row">
        {filteredCategories.map((cat) => (
          <div key={cat.id} className="col-md-4 mb-4">
            <div className="card">
              {/* <img src={cat.image || 'https://via.placeholder.com/300'} className="card-img-top" alt={cat.name} /> */}
              <div className="card-body">
                <h5 className="card-title">{cat.name}</h5>
                <p className="card-text">{cat.description}</p>
                <Link to={`/products/${cat.id}`} className="btn btn-primary">View Products</Link>
                {isAdmin && (
                  <>
                    <Link to={`/admin/categories/edit/${cat.id}`} className="btn btn-warning ms-2">Edit</Link>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="btn btn-danger ms-2">Delete</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {!isAdmin && <Link to="/cart" className="btn btn-info">Go to Cart</Link>}
    </div>
  );
};

export default Home;