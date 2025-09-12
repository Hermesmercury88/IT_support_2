const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// รับ GET /api/devices
router.get('/', deviceController.getAllDevices);

module.exports = router;
