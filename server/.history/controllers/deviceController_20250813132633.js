const db = require('../config/db');

// GET: ดึงอุปกรณ์ทั้งหมดพร้อมชื่อประเภทและแบรนด์
exports.getDevicesWithTypeName = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        d.id,
        d.name,
        d.id_code,
        d.serial_number,
        d.status,
        d.location,
        dt.type_name,
        db.brand_name
      FROM devices d
      LEFT JOIN device_types dt ON d.type = dt.id
      LEFT JOIN device_brand db ON d.brand = db.id
      ORDER BY d.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์', error: err.message });
  }
};

// GET: ดึงรายการ brand ทั้งหมด
exports.getAllBrands = async (req, res) => {
  try {
    const [brands] = await db.query('SELECT * FROM device_brand');
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: 'ดึงข้อมูล brand ไม่สำเร็จ', error: err.message });
  }
};

// GET: ดึงรายการ type ทั้งหมด
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
    cleanedFields[key] = typeof value === 'string' && value.trim() === '' ? null : value;
  }

  if (!('status' in cleanedFields) || cleanedFields.status == null) {
    cleanedFields.status = 'available';
  }

  try {
    const [result] = await db.query('INSERT INTO devices SET ?', [cleanedFields]);
    const [newDevice] = await db.query('SELECT * FROM devices WHERE id = ?', [result.insertId]);
    res.status(201).json(newDevice[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'ไม่สามารถเพิ่มอุปกรณ์ได้', error: err.message });
  }
};

// PUT: แก้ไขอุปกรณ์
exports.updateDevice = async (req, res) => {
  const id = req.params.id;
  const { name, id_code, brand, type, serial_number, status, location } = req.body;

  try {
    const sql = `
      UPDATE devices
      SET name=?, id_code=?, brand=?, type=?, serial_number=?, status=?, location=?
      WHERE id=?
    `;
    const values = [name, id_code, brand, type, serial_number, status, location, id];
    await db.query(sql, values);

    const [updated] = await db.query('SELECT * FROM devices WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'ไม่สามารถอัพเดตข้อมูลได้', error: err.message });
  }
};

// DELETE: Soft delete อุปกรณ์ (เปลี่ยน status เป็น inactive)
exports.deleteDevice = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE devices SET status = "inactive" WHERE id = ?', [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Delete failed');
  }
};
