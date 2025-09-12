// const express = require('express');
// const jwt = require('jsonwebtoken');
// const router = express.Router();
// const deviceController = require('../controllers/deviceController');
// const upload = require('../controllers/ImageUpload'); 

// // middleware ตรวจสอบ token
// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ message: 'Token ไม่ถูกต้องหรือไม่มี token' });
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(403).json({ message: 'Token หมดอายุหรือล้มเหลว' });
//   }
// };

// // Routes
// // Routes
// router.get('/', deviceController.getAllDevices);                     // ✅ public
// router.get('/devices-with-type', deviceController.getDevicesWithTypeName);
// router.post('/', verifyToken, deviceController.addDevice);          // ✅ protected
// router.put('/:id', verifyToken, deviceController.updateDevice);     // ✅ protected
// router.delete('/:id', verifyToken, deviceController.deleteDevice);  // ✅ protected
// router.get('/brands', deviceController.getAllBrands);
// router.get('/types', deviceController.getAllTypes);

// router.post('/:id/upload-image', upload.single('image'), deviceController.uploadDeviceImage);

// module.exports = router;

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const deviceController = require('../controllers/deviceController');
const upload = require('../controllers/ImageUpload'); 

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
router.get('/', deviceController.getAllDevices);                     // public
router.get('/devices-with-type', deviceController.getDevicesWithTypeName);
router.get('/brands', deviceController.getAllBrands);
router.get('/types', deviceController.getAllTypes);

router.post('/', verifyToken, deviceController.addDevice);          // protected
router.put('/:id', verifyToken, deviceController.updateDevice);     // protected
router.delete('/:id', verifyToken, deviceController.deleteDevice);  // protected

// Upload รูป
router.post('/:id/upload-image', verifyToken, upload.single('image'), deviceController.uploadDeviceImage);

module.exports = router;
