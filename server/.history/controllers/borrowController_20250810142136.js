const db = require('../db');

// เพิ่มคำขอยืม
exports.createBorrowRequest = async (req, res) => {
  try {
    const { user_id, device_id, borrow_date } = req.body;

    await db.query(
      'INSERT INTO borrow_requests (user_id, device_id, borrow_date, status) VALUES (?, ?, ?, ?)',
      [user_id, device_id, borrow_date, 'pending']
    );

    res.status(201).json({ message: 'สร้างคำขอยืมเรียบร้อย' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
};

// ดึงรายการคำขอยืม
exports.getBorrowRequests = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT br.id, u.username, d.name AS device_name, br.borrow_date, br.status
      FROM borrow_requests br
      JOIN users u ON br.user_id = u.id
      JOIN devices d ON br.device_id = d.id
      ORDER BY br.borrow_date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
};

// อัปเดตสถานะการยืม (อนุมัติ / ปฏิเสธ)
exports.updateBorrowStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query('UPDATE borrow_requests SET status = ? WHERE id = ?', [status, id]);

    res.json({ message: 'อัปเดตสถานะเรียบร้อย' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
};
