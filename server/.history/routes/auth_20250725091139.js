const express = require('express');
const router = express.Router();
const pool = require('../database'); // เชื่อม DB
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ลงทะเบียน
router.post('/register', async (req, res) => {
  const { username, password, name, role = 'user', department } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: 'กรุณากรอก username และ password' });

  try {
    // เช็ค username ซ้ำ
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0)
      return res.status(409).json({ message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' });

    // เข้ารหัส password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, password, name, role, department) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, name || null, role, department || null]
    );

    res.status(201).json({ message: 'ลงทะเบียนสำเร็จ', userId: result.insertId });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: 'กรุณากรอก username และ password' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0)
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        department: user.department,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '20h' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
});


module.exports = router;
