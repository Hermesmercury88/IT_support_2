import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', form);
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="card card-outline card-primary">
          <div className="card-header text-center"><b>IT Inventory</b> Login</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="input-group mb-3">
                <input name="username" value={form.username} onChange={handleChange} className="form-control" placeholder="Username" />
              </div>
              <div className="input-group mb-3">
                <input name="password" type="password" value={form.password} onChange={handleChange} className="form-control" placeholder="Password" />
              </div>
              {error && <div className="alert alert-danger py-1">{error}</div>}
              <button type="submit" className="btn btn-primary btn-block">Login</button>
            </form>
            <p className="mb-0 mt-3 text-center">
              <a href="/register">Register</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
