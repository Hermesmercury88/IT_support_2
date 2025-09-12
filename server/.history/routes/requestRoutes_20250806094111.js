// routes/requestRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ปรับตาม path จริงของคุณ

// GET /api/my-requests/:userId
router.get('/my-requests/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT br.id, br.reason, br.status, br.created_at, d.name AS device_name
      FROM borrow_requests br
      JOIN devices d ON br.device_id = d.id
      WHERE br.user_id = ?
      ORDER BY br.created_at DESC
    `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
});

module.exports = router;
