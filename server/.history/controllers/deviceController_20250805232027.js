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

exports.createDevice = async (req, res) => {
  const fields = req.body;
  const cleanedFields = {};

  for (let key in fields) {
    const value = fields[key];
    cleanedFields[key] = typeof value === 'string' && value.trim() === '' ? null : value;
  }

  try {
    const [result] = await db.query('INSERT INTO devices SET ?', [cleanedFields]);
    const [newDevice] = await db.query('SELECT * FROM devices WHERE id = ?', [result.insertId]);
    res.status(201).json(newDevice[0]);
  } catch (err) {
    res.status(500).json({ message: 'ไม่สามารถเพิ่มอุปกรณ์ได้', error: err.message });
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
