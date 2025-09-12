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
