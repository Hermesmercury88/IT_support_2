const db = require('../config/db');

// GET: ดึงอุปกรณ์ทั้งหมด
exports.getAllDevices = async (req, res) => {
  try {
    const [devices] = await db.query(`
      SELECT d.*, dt.type_name, db.brand_name
      FROM devices d
      LEFT JOIN device_types dt ON d.type = dt.id
      LEFT JOIN device_brand db ON d.brand = db.id
      ORDER BY d.id DESC
    `);
    res.json(devices);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์', error: err.message });
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
      cleanedFields[key] = value?.trim() === '' ? 'available' : value;
    } else {
      cleanedFields[key] = value?.trim() === '' ? null : value;
    }
  }

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
  const id = req.params.id;
  const { name, id_code, brand, type, serial_number, status, location } = req.body;

  try {
    await db.query(`
      UPDATE devices
      SET name = ?, id_code = ?, brand = ?, type = ?, serial_number = ?, status = ?, location = ?
      WHERE id = ?
    `, [name, id_code, brand, type, serial_number, status, location, id]);

    const [updated] = await db.query('SELECT * FROM devices WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'ไม่สามารถอัพเดตข้อมูลได้' });
  }
};

// DELETE: ลบอุปกรณ์
exports.deleteDevice = async (req, res) => {
  const { id } = req.params;
  try {
    // ลบข้อมูลที่อ้างถึง device_id ทั้งหมดก่อน
    await db.query('DELETE FROM borrow_requests WHERE device_id = ?', [id]);
    await db.query('DELETE FROM borrow_history WHERE device_id = ?', [id]);

    // ลบอุปกรณ์
    await db.query('DELETE FROM devices WHERE id = ?', [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Delete failed');
  }
};

// POST: ยืมอุปกรณ์
exports.borrowDevice = async (req, res) => {
  const { device_id, borrower_name, department, reason } = req.body;

  if (!device_id || !borrower_name || !department) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
  }

  try {
    // ตรวจสอบว่ามีอุปกรณ์และสถานะว่างอยู่ไหม
    const [device] = await db.query(
      'SELECT * FROM devices WHERE id = ? AND status = "available"',
      [device_id]
    );

    if (device.length === 0) {
      return res.status(400).json({ message: "อุปกรณ์ไม่พร้อมให้ยืม" });
    }

    // อัปเดตสถานะอุปกรณ์
    await db.query(
      'UPDATE devices SET status = "borrowed" WHERE id = ?',
      [device_id]
    );

    // บันทึกประวัติการยืม
    await db.query(`
      INSERT INTO borrow_history (device_id, borrower_name, department, reason, borrowed_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [device_id, borrower_name, department, reason]);

    res.status(200).json({ message: "ยืมอุปกรณ์สำเร็จ" });
  } catch (error) {
    console.error("Borrow error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error });
  }
};