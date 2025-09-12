const db = require('../config/db');

exports.getAllBrands = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, brand_name FROM device_brand ORDER BY brand_name ASC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' });
  }
};
