// routes/deviceTypes.js
const express = require('express');
const router = express.Router();
const deviceTypesController = require('../controllers/deviceTypesController');

router.get('/', deviceTypesController.getAllDeviceTypes);
router.get('/:id', deviceTypesController.getDeviceTypeById);
router.post('/', deviceTypesController.createDeviceType);
router.put('/:id', deviceTypesController.updateDeviceType);
router.delete('/:id', deviceTypesController.deleteDeviceType);

router.post('/:id/upload-image', upload.single('image'), deviceController.uploadDeviceImage);

module.exports = router;
