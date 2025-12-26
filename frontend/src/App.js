import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import api from './services/api';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Home from './components/Home/Home';
import ProductPage from './components/Product/ProductPage';
import Cart from './components/Cart/Cart';
import OrderHistory from './components/Order/OrderHistory';
import AdminCategoryForm from './components/Admin/AdminCategoryForm';
import AdminProductForm from './components/Admin/AdminProductForm';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role || null);
        localStorage.setItem('role', decoded.role);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
      }
    }
  }, []);

  const isAdmin = userRole === 'ADMIN';
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('cart');
    setUserRole(null);
    window.location.href = '/login';  // Force reload
  };

  return (
    <Router>
      <div className="container-fluid p-0">
        {isLoggedIn && (
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container">
              <a className="navbar-brand" href="/">Grocery Shop</a>
              <ul className="navbar-nav me-auto">
                {/* <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li> */}
                {!isAdmin && <li className="nav-item"><Link className="nav-link" to="/cart">Cart</Link></li>}
                {!isAdmin && <li className="nav-item"><Link className="nav-link" to="/orders">Orders</Link></li>}
                {/* {isAdmin && <li className="nav-item"><Link className="nav-link" to="/admin/categories/add">Add Category</Link></li>} */}
              </ul>
              <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
            </div>
          </nav>
        )}
        <div className="container mt-4">
          <Routes>
            <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login setUserRole={setUserRole} />} />
            <Route path="/register" element={isLoggedIn ? <Navigate to="/" /> : <Register />} />
            <Route path="/" element={isLoggedIn ? <Home isAdmin={isAdmin} /> : <Navigate to="/login" />} />
            <Route path="/products/:categoryId" element={isLoggedIn ? <ProductPage isAdmin={isAdmin} /> : <Navigate to="/login" />} />
            <Route path="/cart" element={isLoggedIn && !isAdmin ? <Cart /> : <Navigate to="/" />} />
            <Route path="/orders" element={isLoggedIn && !isAdmin ? <OrderHistory /> : <Navigate to="/" />} />
            <Route path="/admin/categories/add" element={isAdmin ? <AdminCategoryForm mode="add" /> : <Navigate to="/" />} />
            <Route path="/admin/categories/edit/:id" element={isAdmin ? <AdminCategoryForm mode="edit" /> : <Navigate to="/" />} />
            <Route path="/admin/products/add/:categoryId" element={isAdmin ? <AdminProductForm mode="add" /> : <Navigate to="/" />} />
            <Route path="/admin/products/edit/:id" element={isAdmin ? <AdminProductForm mode="edit" /> : <Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;