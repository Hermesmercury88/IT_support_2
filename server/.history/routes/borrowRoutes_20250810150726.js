// const express = require('express');
// const router = express.Router();
// const borrowController = require('../controllers/borrowController');

// router.post('/', borrowController.requestBorrow);
// router.get('/', borrowController.getAllBorrowRequests);
// router.put('/:id/approve', borrowController.approveBorrow);
// router.put('/:id/reject', borrowController.rejectBorrow);

// module.exports = router;

const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// POST: ยืมอุปกรณ์
router.post('/', deviceController.borrowDevice);

module.exports = router;
