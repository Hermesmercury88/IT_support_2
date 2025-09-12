const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const verifyToken = require('../middleware/verifyToken');

// รับ GET /api/devices
router.get('/', deviceController.getAllDevices);

// PUT แก้ไขอุปกรณ์
router.put('/:id', verifyToken, deviceController.updateDevice);

// DELETE ลบอุปกรณ์
router.delete('/:id', verifyToken, deviceController.deleteDevice);

module.exports = router;