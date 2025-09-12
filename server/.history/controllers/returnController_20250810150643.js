// controllers/returnController.js
const db = require('../config/db');

// 📌 คืนอุปกรณ์
exports.returnDevice = async (req, res) => {
  try {
    const { device_id } = req.body;

    if (!device_id) {
      return res.status(400).json({ message: 'กรุณาระบุรหัสอุปกรณ์' });
    }

    // 1. ตรวจสอบว่าอุปกรณ์นี้มีสถานะ borrowed หรือไม่
    const [device] = await db.query('SELECT status FROM devices WHERE id = ?', [device_id]);
    if (device.length === 0) {
      return res.status(404).json({ message: 'ไม่พบอุปกรณ์นี้' });
    }
    if (device[0].status !== 'borrowed') {
      return res.status(400).json({ message: 'อุปกรณ์นี้ไม่ได้ถูกยืมอยู่' });
    }

    // 2. อัปเดตสถานะเป็น available
    await db.query('UPDATE devices SET status = ? WHERE id = ?', ['available', device_id]);

    // 3. อัปเดต returned_at ใน borrow_history ล่าสุดของอุปกรณ์นี้
    await db.query(
      `UPDATE borrow_history 
       SET returned_at = NOW() 
       WHERE device_id = ? AND returned_at IS NULL 
       ORDER BY borrowed_at DESC LIMIT 1`,
      [device_id]
    );

    res.json({ message: 'คืนอุปกรณ์สำเร็จ' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
};
