const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ✅ POST: ส่งคำขอยืม
router.post('/borrow-requests', async (req, res) => {
  const { user_id, device_id, reason } = req.body;

  try {
    await db.query(`
      INSERT INTO borrow_requests (user_id, device_id, reason, status, request_date)
      VALUES (?, ?, ?, 'pending', NOW())
    `, [user_id, device_id, reason]);

    res.json({ message: 'ส่งคำขอเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Error submitting request:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการส่งคำขอ' });
  }
});

// ✅ GET: คำขอของ user คนเดียว
router.get('/my-requests/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT 
        br.id, 
        br.reason, 
        br.status, 
        br.request_date, 
        br.approve_date,
        d.name AS device_name,
        u.username
      FROM borrow_requests br
      LEFT JOIN devices d ON br.device_id = d.id
      LEFT JOIN users u ON br.user_id = u.id
      WHERE br.user_id = ?
      ORDER BY br.request_date DESC
    `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
});

// ✅ GET: คำขอทั้งหมด (admin หรือใช้ใน AllBorrowRequests.jsx)
router.get('/borrow-requests', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        br.id,
        br.reason,
        br.status,
        br.request_date,
        br.approve_date,
        u.username,
        d.name AS device_name
      FROM borrow_requests br
      LEFT JOIN users u ON br.user_id = u.id
      LEFT JOIN devices d ON br.device_id = d.id
      ORDER BY br.request_date DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching all borrow requests:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำขอทั้งหมด' });
  }
});

// ✅ GET: คำขอที่รออนุมัติ (admin)
router.get('/borrow-requests/pending', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        br.id, 
        br.reason, 
        br.status, 
        br.request_date, 
        br.approve_date,
        u.username, 
        d.name AS device_name
      FROM borrow_requests br
      LEFT JOIN users u ON br.user_id = u.id
      LEFT JOIN devices d ON br.device_id = d.id
      WHERE br.status = 'pending'
      ORDER BY br.request_date DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching pending requests:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงคำขอ pending' });
  }
});

// ✅ POST: อนุมัติคำขอ
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

// ✅ POST: ปฏิเสธคำขอ
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

module.exports = router;
