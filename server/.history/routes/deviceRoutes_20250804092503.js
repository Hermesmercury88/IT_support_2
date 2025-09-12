const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// verifyToken middleware ที่ฝังไว้ตรงนี้เลย
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token ไม่ถูกต้องหรือไม่มี token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token หมดอายุหรือล้มเหลว' });
  }
};

// Routes
router.get('/', deviceController.getAllDevices); // public
router.put('/:id', verifyToken, deviceController.updateDevice); // protected
router.delete('/:id', verifyToken, deviceController.deleteDevice); // protected

module.exports = router;
