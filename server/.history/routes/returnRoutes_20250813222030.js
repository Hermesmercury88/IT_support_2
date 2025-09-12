const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');

router.post('/return', returnController.returnDevice);
router.post('/return-device', returnDevice);

module.exports = router;

