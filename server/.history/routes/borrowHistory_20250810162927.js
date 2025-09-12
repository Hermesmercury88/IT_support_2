const express = require('express');
const router = express.Router();
const { getBorrowHistoryWithDevice } = require('../controllers/borrowHistoryController');

router.get('/', getBorrowHistoryWithDevice);

module.exports = router;
