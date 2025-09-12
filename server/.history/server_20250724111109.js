import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // ตรวจสอบ username/password หรือ fetch API
    navigate('/dashboard'); // เปลี่ยน path หลัง Login สำเร็จ
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/logo.png" alt="logo" className="logo" />
        <h2>เข้าสู่ระบบ</h2>

        <label>Username</label>
        <input type="text" placeholder="Enter username" />

        <label>Password</label>
        <input type="password" placeholder="Enter password" />

        <button onClick={handleLogin} className="login-btn">Log in</button>
        <button onClick={() => navigate('/register')} className="register-btn">Register</button>
      </div>
    </div>
  );
}
