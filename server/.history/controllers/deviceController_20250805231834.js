const db = require('../config/db');

// GET: ดึงอุปกรณ์ทั้งหมด
exports.getAllDevices = async (req, res) => {
  try {
    const [devices] = await db.query('SELECT * FROM devices');
    res.json(devices);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์', error: err.message });
  }
};

// POST: เพิ่มอุปกรณ์ใหม่
// exports.addDevice = async (req, res) => {
//   const { name, serial_number, category, status, location, description } = req.body;

//   try {
//     await db.query(
//       'INSERT INTO devices (name, serial_number, category, status, location, description) VALUES (?, ?, ?, ?, ?, ?)',
//       [name, serial_number, category, status, location, description]
//     );
//     res.status(201).json({ message: 'เพิ่มอุปกรณ์เรียบร้อยแล้ว' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มอุปกรณ์', error: err.message });
//   }
// };



// PUT: แก้ไขอุปกรณ์
exports.updateDevice = async (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  // แปลงค่าว่าง (empty string) เป็น null
  const updatedFields = {};
  for (let key in fields) {
    const value = fields[key];
    updatedFields[key] = typeof value === 'string' && value.trim() === '' ? null : value;
  }

  try {
    await db.query('UPDATE devices SET ? WHERE id = ?', [updatedFields, id]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Update failed');
  }
};

// DELETE: ลบอุปกรณ์
exports.deleteDevice = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM devices WHERE id = ?', [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Delete failed');
  }
};
