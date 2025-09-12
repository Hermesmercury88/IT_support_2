// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // สร้าง token
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

      res.json({ token });
    }
  );
});

// ✅ POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, password],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error registering user' });
      }
      res.json({ message: 'User registered successfully' });
    }
  );
});

module.exports = router;
