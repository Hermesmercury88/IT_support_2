const express = require('express');
const router = express.Router();
const upload = require('../controllers/ImageUpload');

// route สำหรับอัพโหลดรูปภาพแยก
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'ไม่มีไฟล์อัพโหลด' });
  res.json({ message: 'อัพโหลดสำเร็จ', path: `/uploads/${req.file.filename}` });
});

module.exports = router;
