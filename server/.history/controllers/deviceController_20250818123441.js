const db = require('../config/db');

// GET: ดึงอุปกรณ์ทั้งหมด
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

// GET: ดึงอุปกรณ์ทั้งหมดพร้อมชื่อประเภทและแบรนด์
exports.getDevicesWithTypeName = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.*, dt.type_name, db.brand_name
      FROM devices d
      LEFT JOIN device_types dt ON d.type = dt.id
      LEFT JOIN device_brand db ON d.brand = db.id
      ORDER BY d.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching devices:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: err.message });
  }
};

// GET: ดึง brand ทั้งหมด
exports.getAllBrands = async (req, res) => {
  try {
    const [brands] = await db.query('SELECT * FROM device_brand');
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: 'ดึงข้อมูล brand ไม่สำเร็จ', error: err.message });
  }
};

// GET: ดึง type ทั้งหมด
exports.getAllTypes = async (req, res) => {
  try {
    const [types] = await db.query('SELECT * FROM device_types');
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: 'ดึงข้อมูล type ไม่สำเร็จ', error: err.message });
  }
};

// POST: เพิ่มอุปกรณ์ใหม่
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

  // ถ้ามีไฟล์ image ให้บันทึก path
  if (req.file) {
    cleanedFields.image = `/uploads/${req.file.filename}`;
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

// PUT: แก้ไขอุปกรณ์ (รับ brand/type เป็น id) + รูป
exports.updateDevice = async (req, res) => {
  const id = req.params.id;
  const { name, id_code, brand, type, serial_number, status, location } = req.body;

  // ถ้ามีไฟล์ image
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const sql = `
      UPDATE devices
      SET name = ?, id_code = ?, brand = ?, type = ?, serial_number = ?, status = ?, location = ?, image = COALESCE(?, image)
      WHERE id = ?
    `;
    await db.query(sql, [name, id_code, brand, type, serial_number, status, location, imagePath, id]);

    const [updated] = await db.query(`
      SELECT d.*, dt.type_name, db.brand_name
      FROM devices d
      LEFT JOIN device_types dt ON d.type = dt.id
      LEFT JOIN device_brand db ON d.brand = db.id
      WHERE d.id = ?
    `, [id]);

    res.json(updated[0]);
  } catch (err) {
    console.error('Error updating device:', err);
    res.status(500).json({ message: 'ไม่สามารถอัพเดตข้อมูลได้', error: err.message });
  }
};

// DELETE อุปกรณ์
exports.deleteDevice = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM borrow_requests WHERE device_id = ?', [id]);
    await db.query('DELETE FROM devices WHERE id = ?', [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error('Error deleting device:', err);
    res.status(500).send('Delete failed');
  }
};
