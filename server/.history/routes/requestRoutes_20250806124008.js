// routes/requestRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ปรับตาม path จริงของคุณ

// ✅ ดึงคำขอของผู้ใช้เฉพาะ userId
router.get('/my-requests/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT br.id, br.reason, br.status, br.request_date, d.name AS device_name
      FROM borrow_requests br
      JOIN devices d ON br.device_id = d.id
      WHERE br.user_id = ?
      ORDER BY br.request_date DESC
    `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
});

// ✅ ดึงคำขอทั้งหมดที่รออนุมัติ (สำหรับ admin)
router.get('/borrow-requests/pending', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT br.id, br.reason, br.status, br.request_date, u.username, d.name AS device_name
      FROM borrow_requests br
      JOIN users u ON br.user_id = u.id
      JOIN devices d ON br.device_id = d.id
      WHERE br.status = 'pending'
      ORDER BY br.request_date DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching pending requests:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงคำขอ pending' });
  }
});

// ✅ อนุมัติคำขอ
router.post('/borrow-requests/approve/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(`
      UPDATE borrow_requests
      SET status = 'approved', approve_date = NOW()
      WHERE id = ?
    `, [id]);

    res.json({ message: 'อนุมัติเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Error approving request:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอนุมัติ' });
  }
});

// ✅ ปฏิเสธคำขอ
router.post('/borrow-requests/reject/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(`
      UPDATE borrow_requests
      SET status = 'rejected', approve_date = NOW()
      WHERE id = ?
    `, [id]);

    res.json({ message: 'ปฏิเสธเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Error rejecting request:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการปฏิเสธ' });
  }
});

// ✅ export router
module.exports = router;
