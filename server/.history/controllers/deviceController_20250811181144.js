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

// GET: ดึงอุปกรณ์ทั้งหมดพร้อมชื่อประเภท
exports.getDevicesWithTypeName = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        d.id,
        d.name,
        d.brand_id,
        db.brand_name,
        d.id_code,
        d.serial_number,
        d.status,
        d.location,
        d.created_at,
        dt.type_name
      FROM devices d
      LEFT JOIN device_types dt ON d.type = dt.id
      LEFT JOIN device_brand db ON d.brand_id = db.id
      ORDER BY d.id DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching devices with type and brand name:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์พร้อมชื่อประเภทและยี่ห้อ', error: err.message });
  }
};

// POST: เพิ่มอุปกรณ์ใหม่
exports.addDevice = async (req, res) => {
  const fields = req.body;
  const cleanedFields = {};

  for (let key in fields) {
    const value = fields[key];

    // ตรวจสอบกรณี status เป็นค่าว่างหรือละไว้
    if (key === 'status') {
      cleanedFields[key] =
        typeof value === 'string' && value.trim() === ''
          ? 'available'
          : value;
    } else {
      cleanedFields[key] =
        typeof value === 'string' && value.trim() === ''
          ? null
          : value;
    }
  }

  // ถ้าไม่ได้ส่ง status มาเลย ให้กำหนด default เป็น available
  if (!('status' in cleanedFields) || cleanedFields.status == null) {
    cleanedFields.status = 'available';
  }

  try {
    const [result] = await db.query('INSERT INTO devices SET ?', [cleanedFields]);
    const [newDevice] = await db.query('SELECT * FROM devices WHERE id = ?', [result.insertId]);
    res.status(201).json(newDevice[0]);
  } catch (err) {
    res.status(500).json({ message: 'ไม่สามารถเพิ่มอุปกรณ์ได้', error: err.message });
  }
};


// PUT: แก้ไขอุปกรณ์
exports.updateDevice = async (req, res) => {
  const { id } = req.params;
  const fields = req.body;

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
