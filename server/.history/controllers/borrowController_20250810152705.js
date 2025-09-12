// const db = require('../config/db');

// exports.requestBorrow = async (req, res) => {
//   const { user_id, device_id } = req.body;

//   try {
//     await db.query(
//       'INSERT INTO borrow_requests (user_id, device_id) VALUES (?, ?)',
//       [user_id, device_id]
//     );
//     res.status(201).json({ message: 'ส่งคำขอเบิกเรียบร้อยแล้ว' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getAllBorrowRequests = async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT br.*, u.name AS user_name, d.name AS device_name
//       FROM borrow_requests br
//       JOIN users u ON br.user_id = u.id
//       JOIN devices d ON br.device_id = d.id
//       ORDER BY br.request_date DESC
//     `);
//     res.json(rows);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.approveBorrow = async (req, res) => {
//   const { id } = req.params;

//   try {
//     await db.query('UPDATE borrow_requests SET status = "approved", approve_date = NOW() WHERE id = ?', [id]);
//     await db.query('UPDATE devices SET status = "borrowed" WHERE id = (SELECT device_id FROM borrow_requests WHERE id = ?)', [id]);
//     res.json({ message: 'อนุมัติคำขอเบิกแล้ว' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.rejectBorrow = async (req, res) => {
//   const { id } = req.params;

//   try {
//     await db.query('UPDATE borrow_requests SET status = "rejected", approve_date = NOW() WHERE id = ?', [id]);
//     res.json({ message: 'ปฏิเสธคำขอเบิกแล้ว' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// controllers/deviceController.js
const db = require('../config/db');

// 📌 ยืมอุปกรณ์
exports.borrowDevice = async (req, res) => {
  try {
    const { device_id, borrower_name, department, reason } = req.body;

    if (!device_id || !borrower_name || !department) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // 1. ตรวจสอบว่าอุปกรณ์ว่างอยู่หรือไม่
    const [device] = await db.query('SELECT status FROM devices WHERE id = ?', [device_id]);
    if (device.length === 0) {
      return res.status(404).json({ message: 'ไม่พบอุปกรณ์นี้' });
    }
    if (device[0].status !== 'available') {
      return res.status(400).json({ message: 'อุปกรณ์นี้ไม่ว่าง' });
    }

    // 2. อัปเดตสถานะอุปกรณ์
    await db.query('UPDATE devices SET status = ? WHERE id = ?', ['borrowed', device_id]);

    // 3. บันทึกประวัติการยืม
    await db.query(
      'INSERT INTO borrow_history (device_id, borrower_name, department, reason, borrowed_at) VALUES (?, ?, ?, ?, NOW())',
      [device_id, borrower_name, department, reason || null]
    );

    res.json({ message: 'ยืมอุปกรณ์สำเร็จ' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
  }
};

exports.getBorrowHistory = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT bh.id, d.name AS device_name, bh.department, bh.reason,
             bh.borrowed_at, bh.returned_at
      FROM borrow_history bh
      JOIN devices d ON bh.device_id = d.id
      ORDER BY bh.borrowed_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
  }
};