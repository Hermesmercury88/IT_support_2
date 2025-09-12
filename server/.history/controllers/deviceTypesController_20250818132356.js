// controllers/deviceTypesController.js
const db = require('../config/db');


// ดึงข้อมูลทั้งหมด
exports.getAllDeviceTypes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM device_types');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ดึงข้อมูลตาม id
exports.getDeviceTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM device_types WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// เพิ่มข้อมูล
exports.createDeviceType = async (req, res) => {
  try {
    const { type_name } = req.body;
    if (!type_name) return res.status(400).json({ message: 'type_name is required' });

    const [result] = await db.query('INSERT INTO device_types (type_name) VALUES (?)', [type_name]);
    res.status(201).json({ id: result.insertId, type_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// แก้ไขข้อมูล
exports.updateDeviceType = async (req, res) => {
  try {
    const { id } = req.params;
    const { type_name } = req.body;
    const [result] = await db.query('UPDATE device_types SET type_name = ? WHERE id = ?', [type_name, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ id, type_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ลบข้อมูล
exports.deleteDeviceType = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM device_types WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
