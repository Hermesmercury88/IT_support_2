const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');

router.post('/', returnController.createReturnRequest);
router.get('/', returnController.getReturnRequests);
router.put('/:id', returnController.updateReturnStatus);

module.exports = router;
