const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const upload = require('../controllers/ImageUpload');

// CRUD devices
router.get('/', deviceController.getAllDevices);
router.get('/brands', deviceController.getAllBrands);
router.get('/types', deviceController.getAllTypes);
router.post('/', deviceController.addDevice);
router.put('/:id', deviceController.updateDevice);
router.delete('/:id', deviceController.deleteDevice);

// --- Route upload image ---
router.post('/:id/upload-image', upload.single('image'), deviceController.uploadDeviceImage);

module.exports = router;
