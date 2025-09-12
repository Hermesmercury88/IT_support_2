// controllers/borrowHistoryController.js
const db = require('../config/db');

const getBorrowHistoryWithDevice = async (req, res) => {
  try {
    const sql = `
      SELECT
        d.id,
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
      FROM devices d
      INNER JOIN borrow_history bh ON bh.device_id = d.id
      LEFT JOIN device_types dt ON d.type = dt.id
      LEFT JOIN device_brand db ON d.brand = db.id
      ORDER BY bh.borrowed_at DESC
    `;

    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (error) {
    console.error('Error in getBorrowHistoryWithDevice:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getBorrowHistoryWithDevice,
};
