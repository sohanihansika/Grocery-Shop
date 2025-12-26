import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // client-side validation before sending to server
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await api.post('/auth/register', { email, password });
      alert('Registered!');
      navigate('/login');
    } catch (err) {
      // display server-provided error if available
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ width: '400px' }}>
        <h2 className="text-center mb-4">REGISTER</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <div className="mb-3 text-muted small">
            {password && password.length < 8 && <div className="text-danger">Password should be at least 8 characters.</div>}
            {confirmPassword && password !== confirmPassword && <div className="text-danger">Passwords do not match.</div>}
            {/* {password && confirmPassword && password === confirmPassword && password.length >= 8 && <div className="text-success">Passwords match</div>} */}
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={!(password && confirmPassword && password === confirmPassword && password.length >= 8)}>Register</button>
        </form>
        <p className="text-center mt-3">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;