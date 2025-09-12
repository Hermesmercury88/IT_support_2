const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

//  REGISTER
router.post('/register', async (req, res) => {
  const { username, password, name, role, department } = req.body;

  try {
    const [userCheck] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (userCheck.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (username, password, name, role, department) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, name, role || 'user', department]
    );

    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//  LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

//  GET DEVICES
// router.get('/devices', async (req, res) => {
//   try {
//     const [rows] = await db.query('SELECT * FROM devices');
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ message: 'Error loading devices', error: err.message });
//   }
// });

// router.get('/devices', deviceController.getAllDevices);

module.exports = router;
