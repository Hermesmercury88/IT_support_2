// controllers/borrowHistoryController.js
const pool = require('../config/db'); 

// ดึงประวัติการยืม (รองรับกรองเดือน/ปี)
const getBorrowHistoryWithDevice = async (req, res) => {
  try {
    const { day, month, year } = req.query;
const params = [];
const conditions = [];

if (day) {
  conditions.push('DAY(bh.borrowed_at) = ?');
  params.push(Number(day));
}
if (month) {
  conditions.push('MONTH(bh.borrowed_at) = ?');
  params.push(Number(month));
}
if (year) {
  conditions.push('YEAR(bh.borrowed_at) = ?');
  params.push(Number(year));
}


    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        d.id,
        dt.type_name,
        d.name AS device_name,
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
      ${whereClause}
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
const getAllBrands = async (req, res) => {
  try {
    const [brands] = await pool.query('SELECT * FROM device_brand');
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: 'ดึงข้อมูล brand ไม่สำเร็จ', error: err.message });
  }
};

// ดึงรายการ type ทั้งหมด
const getAllTypes = async (req, res) => {
  try {
    const [types] = await pool.query('SELECT * FROM device_types');
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: 'ดึงข้อมูล type ไม่สำเร็จ', error: err.message });
  }
};

module.exports = {
  getBorrowHistoryWithDevice,
  getAllBrands,
  getAllTypes,
};
