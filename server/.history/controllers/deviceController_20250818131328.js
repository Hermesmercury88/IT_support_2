const db = require('../config/db');

// GET devices ทั้งหมด
exports.getAllDevices = async (req, res) => {
  try {
    const [devices] = await db.query(`
      SELECT d.*, dt.type_name, db.brand_name
      FROM devices d
      LEFT JOIN device_types dt ON d.type = dt.id
      LEFT JOIN device_brand db ON d.brand = db.id
    `);
    res.json(devices);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์', error: err.message });
  }
};

// GET brands/types
exports.getAllBrands = async (req, res) => {
  try {
    const [brands] = await db.query('SELECT * FROM device_brand');
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: 'ดึงข้อมูล brand ไม่สำเร็จ', error: err.message });
  }
};

exports.getAllTypes = async (req, res) => {
  try {
    const [types] = await db.query('SELECT * FROM device_types');
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: 'ดึงข้อมูล type ไม่สำเร็จ', error: err.message });
  }
};

// POST เพิ่ม device
exports.addDevice = async (req, res) => {
  const fields = req.body;
  const cleanedFields = {};

  for (let key in fields) {
    const value = fields[key];
    if (key === 'status') {
      cleanedFields[key] = typeof value === 'string' && value.trim() === '' ? 'available' : value;
    } else {
      cleanedFields[key] = typeof value === 'string' && value.trim() === '' ? null : value;
    }
  }

  delete cleanedFields.id;
  if (!('status' in cleanedFields) || cleanedFields.status == null) {
    cleanedFields.status = 'available';
  }

  if (req.file) {
    cleanedFields.image = req.file.filename;
  }

  try {
    const [result] = await db.query('INSERT INTO devices SET ?', [cleanedFields]);

    const [newDevice] = await db.query(`
      SELECT d.*, dt.type_name, db.brand_name
      FROM devices d
      LEFT JOIN device_types dt ON d.type = dt.id
      LEFT JOIN device_brand db ON d.brand = db.id
      WHERE d.id = ?
    `, [result.insertId]);

    res.status(201).json(newDevice[0]);
  } catch (err) {
    res.status(500).json({ message: 'ไม่สามารถเพิ่มอุปกรณ์ได้', error: err.message });
  }
};

// PUT update device (ไม่รวมรูป)
exports.updateDevice = async (req, res) => {
  const id = req.params.id;
  const { name, id_code, brand, type, serial_number, status, location } = req.body;

  try {
    const sql = `
      UPDATE devices
      SET name = ?, id_code = ?, brand = ?, type = ?, serial_number = ?, status = ?, location = ?
      WHERE id = ?
    `;
    await db.query(sql, [name, id_code, brand, type, serial_number, status, location, id]);

    const [updated] = await db.query(`
      SELECT d.*, dt.type_name, db.brand_name
      FROM devices d
      LEFT JOIN device_types dt ON d.type = dt.id
      LEFT JOIN device_brand db ON d.brand = db.id
      WHERE d.id = ?
    `, [id]);

    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: 'ไม่สามารถอัพเดตข้อมูลได้', error: err.message });
  }
};

// POST upload image สำหรับ device
exports.uploadDeviceImage = async (req, res) => {
  const id = req.params.id;

  if (!req.file) return res.status(400).json({ message: 'ไม่มีไฟล์อัปโหลด' });

  try {
    await db.query('UPDATE devices SET image = ? WHERE id = ?', [req.file.filename, id]);
    res.json({ message: 'อัปโหลดรูปสำเร็จ', filename: req.file.filename });
  } catch (err) {
    res.status(500).json({ message: 'ไม่สามารถอัปโหลดรูปได้', error: err.message });
  }
};

// DELETE device
exports.deleteDevice = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM borrow_requests WHERE device_id = ?', [id]);
    await db.query('DELETE FROM devices WHERE id = ?', [id]);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send('Delete failed');
  }
};
