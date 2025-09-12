const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db'); 
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    await db.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, password]
    );
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
