const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// localhost:4000/api/devices
router.get('/devices', deviceController.getAllDevices);

module.exports = router;
