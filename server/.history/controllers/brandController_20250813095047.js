// controllers/brandController.js
const db = require('../config/db');

// ดึงข้อมูล brand ทั้งหมด
exports.getAllBrands = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, brand_name FROM device_brand ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// เพิ่ม brand ใหม่
exports.addBrand = async (req, res) => {
  const { brand_name } = req.body;
  if (!brand_name) {
    return res.status(400).json({ message: 'กรุณากรอกชื่อแบรนด์' });
  }
  try {
    const [result] = await db.query('INSERT INTO device_brand (brand_name) VALUES (?)', [brand_name]);
    res.json({ id: result.insertId, brand_name });
  } catch (error) {
    console.error('Error adding brand:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
