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
const borrowController = require('../controllers/borrowController');

router.post('/borrow', borrowController.borrowDevice);

module.exports = router;
