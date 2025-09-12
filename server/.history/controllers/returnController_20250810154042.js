const db = require('../config/db');

// ฟังก์ชันคืนอุปกรณ์
exports.returnDevice = async (req, res) => {
  const { device_id } = req.body;

  if (!device_id) {
    return res.status(400).json({ message: "กรุณาระบุรหัสอุปกรณ์" });
  }

  try {
    // ตรวจสอบว่ามีอุปกรณ์สถานะ borrowed ไหม
    const [device] = await db.query(
      'SELECT * FROM devices WHERE id = ? AND status = "borrowed"',
      [device_id]
    );

    if (device.length === 0) {
      return res.status(400).json({ message: "อุปกรณ์นี้ไม่ได้อยู่ในสถานะยืม" });
    }

    // อัปเดตสถานะอุปกรณ์
    await db.query(
      'UPDATE devices SET status = "available" WHERE id = ?',
      [device_id]
    );

    // อัปเดตวันที่คืนล่าสุดใน borrow_history
    await db.query(
      `UPDATE borrow_history 
       SET returned_at = NOW() 
       WHERE device_id = ? AND returned_at IS NULL`,
      [device_id]
    );

    res.status(200).json({ message: "คืนอุปกรณ์สำเร็จ" });
  } catch (error) {
    console.error("Return error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error });
  }
};