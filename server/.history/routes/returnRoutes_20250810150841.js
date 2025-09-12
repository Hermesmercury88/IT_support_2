// routes/returnRoutes.js
const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');

// POST: คืนอุปกรณ์
router.post('/', returnController.returnDevice);

module.exports = router;

