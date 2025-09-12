// routes/brandRoutes.js
const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');

// ดึงแบรนด์ทั้งหมด
router.get('/', brandController.getAllBrands);

// เพิ่มแบรนด์ใหม่
router.post('/', brandController.addBrand);

module.exports = router;
