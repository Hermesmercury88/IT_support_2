const pool = require('../config/db'); 

// ดึงประวัติการยืมทั้งหมด (รองรับ device_id เป็น NULL)
const getBorrowHistoryWithDevice = async (req, res) => {
  try {
    // ถ้ามีการกรองตามเดือน
    const { month, year } = req.query;
    let filter = '';
    let params = [];

    if (month && year) {
      filter = 'WHERE MONTH(bh.borrowed_at) = ? AND YEAR(bh.borrowed_at) = ?';
      params.push(month, year);
    }

    const sql = `
      SELECT
        d.id AS device_id,
        dt.type_name,
        d.name AS device_name,
        d.brand,
        db.brand_name,
        d.id_code,
        d.serial_number,
        bh.borrower_name,
        bh.department,
        bh.reason,
        bh.borrowed_at,
        bh.returned_at
      FROM borrow_history bh
      LEFT JOIN devices d ON bh.device_id = d.id
      LEFT JOIN device_types dt ON d.type = dt.id
      LEFT JOIN device_brand db ON d.brand = db.id
      ${filter}
      ORDER BY bh.borrowed_at DESC
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Error in getBorrowHistoryWithDevice:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ดึงรายการ brand ทั้งหมด
exports.getAllBrands = async (req, res) => {
  try {
    const [brands] = await pool.query('SELECT * FROM device_brand');
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: 'ดึงข้อมูล brand ไม่สำเร็จ', error: err.message });
  }
};

// ดึงรายการ type ทั้งหมด
exports.getAllTypes = async (req, res) => {
  try {
    const [types] = await pool.query('SELECT * FROM device_types');
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: 'ดึงข้อมูล type ไม่สำเร็จ', error: err.message });
  }
};

module.exports = {
  getBorrowHistoryWithDevice,
  getAllBrands: exports.getAllBrands,
  getAllTypes: exports.getAllTypes
};
