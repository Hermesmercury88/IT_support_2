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

router.post('/', borrowController.createBorrowRequest);
router.get('/', borrowController.getBorrowRequests);
router.put('/:id', borrowController.updateBorrowStatus);

module.exports = router;

