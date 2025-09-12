const multer = require('multer');
const path = require('path');

// ตั้งค่า storage ของ multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // ตั้งชื่อไฟล์เป็น timestamp + extension เดิม
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// กำหนด multer
const upload = multer({ storage });

module.exports = upload;
