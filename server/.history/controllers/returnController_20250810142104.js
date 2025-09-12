const db = require('../db');

// เพิ่มคำขอคืน
exports.createReturnRequest = async (req, res) => {
  try {
    const { borrow_id, return_date } = req.body;

    await db.query(
      'INSERT INTO return_requests (borrow_id, return_date, status) VALUES (?, ?, ?)',
      [borrow_id, return_date, 'pending']
    );

    res.status(201).json({ message: 'สร้างคำขอคืนเรียบร้อย' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
};

// ดึงรายการคำขอคืน
exports.getReturnRequests = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT rr.id, u.username, d.name AS device_name, rr.return_date, rr.status
      FROM return_requests rr
      JOIN borrow_requests br ON rr.borrow_id = br.id
      JOIN users u ON br.user_id = u.id
      JOIN devices d ON br.device_id = d.id
      ORDER BY rr.return_date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
};

// อัปเดตสถานะการคืน
exports.updateReturnStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query('UPDATE return_requests SET status = ? WHERE id = ?', [status, id]);

    res.json({ message: 'อัปเดตสถานะเรียบร้อย' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
};
