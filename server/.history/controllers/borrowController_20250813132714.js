const db = require('../config/db');

// POST: ยืมอุปกรณ์
exports.borrowDevice = async (req, res) => {
  const { device_id, borrower_name, department, reason } = req.body;

  if (!device_id || !borrower_name || !department) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
  }

  try {
    // ตรวจสอบอุปกรณ์ว่าง
    const [device] = await db.query(
      'SELECT * FROM devices WHERE id = ? AND status = "available"',
      [device_id]
    );

    if (device.length === 0) {
      return res.status(400).json({ message: "อุปกรณ์ไม่พร้อมให้ยืม" });
    }

    // อัปเดตสถานะอุปกรณ์
    await db.query('UPDATE devices SET status = "borrowed" WHERE id = ?', [device_id]);

    // บันทึกประวัติการยืม
    await db.query(
      `INSERT INTO borrow_history (device_id, borrower_name, department, reason, borrowed_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [device_id, borrower_name, department, reason]
    );

    res.status(200).json({ message: "ยืมอุปกรณ์สำเร็จ" });
  } catch (err) {
    console.error("Borrow error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  }
};
