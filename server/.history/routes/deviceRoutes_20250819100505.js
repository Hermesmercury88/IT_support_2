const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const upload = require('../controllers/ImageUpload'); // import multer

// middleware ตรวจสอบ token
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
router.get('/', deviceController.getAllDevices);
router.get('/devices-with-type', deviceController.getDevicesWithTypeName);

// ✅ รองรับอัปโหลดรูป
router.post('/', verifyToken, upload.single('image'), deviceController.addDevice);
router.put('/:id', verifyToken, upload.single('image'), deviceController.updateDevice);

router.delete('/:id', verifyToken, deviceController.deleteDevice);
router.get('/brands', deviceController.getAllBrands);
router.get('/types', deviceController.getAllTypes);

module.exports = router;
