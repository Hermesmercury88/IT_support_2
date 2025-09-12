// server/routes/deviceRoutes.js
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
router.get('/brands', deviceController.getAllBrands);
router.get('/types', deviceController.getAllTypes);

// สร้างอุปกรณ์ใหม่ พร้อมอัปโหลดรูป
router.post('/', verifyToken, upload.single('image'), deviceController.addDevice);

// แก้ไขอุปกรณ์ พร้อมอัปโหลดรูป
router.put('/:id', verifyToken, upload.single('image'), deviceController.updateDevice);

// ลบอุปกรณ์
router.delete('/:id', verifyToken, deviceController.deleteDevice);

// ✅ เพิ่ม route อัปโหลดรูปเฉพาะ device หลังสร้างแล้ว
router.post('/:id/upload-image', verifyToken, upload.single('image'), async (req, res) => {
  const deviceId = req.params.id;

  if (!req.file) {
    return res.status(400).json({ message: 'ไม่ได้เลือกไฟล์' });
  }

  const imagePath = `/uploads/${req.file.filename}`;

  try {
    // update field image ใน DB
    await deviceController.updateDeviceImage(deviceId, imagePath);

    // ดึงข้อมูล device ล่าสุด
    const [device] = await deviceController.getDeviceById(deviceId);
    res.json({ message: 'อัปโหลดรูปสำเร็จ', device: device[0] });
  } catch (err) {
    console.error('Error uploading device image:', err);
    res.status(500).json({ message: 'อัปโหลดรูปไม่สำเร็จ', error: err.message });
  }
});

module.exports = router;
