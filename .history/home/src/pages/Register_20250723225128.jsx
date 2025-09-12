import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    department: '',
    role: 'user',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/api/auth/register', form);
      setSuccess('ลงทะเบียนสำเร็จ! ไปหน้า Login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  return (
    <div className="register-page">
      <div className="register-box">
        <div className="card card-outline card-primary">
          <div className="card-header text-center"><b>IT Inventory</b> Register</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="input-group mb-2">
                <input name="username" onChange={handleChange} value={form.username} className="form-control" placeholder="Username" required />
              </div>
              <div className="input-group mb-2">
                <input type="password" name="password" onChange={handleChange} value={form.password} className="form-control" placeholder="Password" required />
              </div>
              <div className="input-group mb-2">
                <input name="name" onChange={handleChange} value={form.name} className="form-control" placeholder="ชื่อ-นามสกุล" />
              </div>
              <div className="input-group mb-2">
                <input name="department" onChange={handleChange} value={form.department} className="form-control" placeholder="แผนก" />
              </div>
              <div className="input-group mb-2">
                <select name="role" value={form.role} onChange={handleChange} className="form-control">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {error && <div className="alert alert-danger py-1">{error}</div>}
              {success && <div className="alert alert-success py-1">{success}</div>}

              <button type="submit" className="btn btn-primary btn-block">ลงทะเบียน</button>
            </form>

            <p className="mt-2 text-center">
              <a href="/login">← กลับสู่หน้า Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
