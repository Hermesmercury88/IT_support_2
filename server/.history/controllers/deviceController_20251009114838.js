// server/controllers/deviceController.js
const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// ===== ตั้งค่า multer ให้รับเฉพาะไฟล์รูป =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error('ONLY_IMAGE'), false); // ส่ง error code กลับไป
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// middleware สำหรับจัดการ error ของ multer
exports.uploadMiddleware = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.message === 'ONLY_IMAGE') {
        return res.status(400).json({ error: 'อนุญาตให้อัพโหลดเฉพาะไฟล์รูป' });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'ไฟล์ใหญ่เกินไป (สูงสุด 5MB)' });
      }
      return res.status(400).json({ error: 'อัพโหลดไฟล์ไม่สำเร็จ' });
    }
    next();
  });
};
// ===============================================


// ฟังก์ชันช่วยลบไฟล์รูป
const deleteOldImage = (oldImagePath) => {
  if (oldImagePath) {
    const fullPath = path.join(__dirname, '..', oldImagePath);
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.warn(`⚠️ ไม่สามารถลบไฟล์ ${fullPath}:`, err.message);
      } else {
        console.log(`🗑️ ลบไฟล์รูปเก่า ${fullPath} สำเร็จ`);
      }
    });
  }
};

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
    console.error('Error fetching devices with type name and brand name:', err);
    res.status(500).json({ 
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์พร้อมชื่อประเภทและชื่อแบรนด์', 
      error: err.message 
    });
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

// PUT: แก้ไขอุปกรณ์
exports.updateDevice = async (req, res) => {
  const id = req.params.id;
  const { name, id_code, brand, type, serial_number, status, location } = req.body;

  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    if (imagePath) {
      const [old] = await db.query('SELECT image FROM devices WHERE id = ?', [id]);
      if (old.length > 0 && old[0].image) {
        deleteOldImage(old[0].image);
      }
    }

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
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ message: 'ไม่สามารถอัพเดตข้อมูลได้', error: error.message });
  }
};

// DELETE: ลบอุปกรณ์
exports.deleteDevice = async (req, res) => {
  const { id } = req.params;
  try {
    const [device] = await db.query('SELECT image FROM devices WHERE id = ?', [id]);

    if (device.length > 0 && device[0].image) {
      deleteOldImage(device[0].image);
    }

    await db.query('DELETE FROM borrow_requests WHERE device_id = ?', [id]);
    await db.query('DELETE FROM devices WHERE id = ?', [id]);

    res.sendStatus(200);
  } catch (err) {
    console.error('Error deleting device:', err);
    res.status(500).send('Delete failed');
  }
};

// อัปโหลดรูป
exports.uploadDeviceImage = async (req, res) => {
  const deviceId = req.params.id;

  if (!req.file) {
    return res.status(400).json({ message: 'กรุณาเลือกไฟล์รูป' });
  }

  const imagePath = `/uploads/${req.file.filename}`;

  try {
    const [old] = await db.query('SELECT image FROM devices WHERE id = ?', [deviceId]);
    if (old.length > 0 && old[0].image) {
      deleteOldImage(old[0].image);
    }

    await db.query(
      'UPDATE devices SET image = ? WHERE id = ?',
      [imagePath, deviceId]
    );

    const [device] = await db.query(
      'SELECT d.*, dt.type_name, db.brand_name FROM devices d LEFT JOIN device_types dt ON d.type = dt.id LEFT JOIN device_brand db ON d.brand = db.id WHERE d.id = ?',
      [deviceId]
    );

    res.json({ message: 'อัปโหลดรูปสำเร็จ', device: device[0] });
  } catch (err) {
    console.error('Error uploading device image:', err);
    res.status(500).json({ message: 'อัปโหลดรูปไม่สำเร็จ', error: err.message });
  }
};

// ดึง device ตาม id
exports.getDeviceById = async (id) => {
  return db.query('SELECT * FROM devices WHERE id = ?', [id]);
};

// update field image
exports.updateDeviceImage = async (id, imagePath) => {
  return db.query('UPDATE devices SET image = ? WHERE id = ?', [imagePath, id]);
};

// ===== เพิ่ม middleware สำหรับอัปโหลดหลายรูป =====
exports.uploadMultipleMiddleware = (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      if (err.message === 'ONLY_IMAGE') {
        return res.status(400).json({ error: 'อนุญาตให้อัพโหลดเฉพาะไฟล์รูป' });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'ไฟล์ใหญ่เกินไป (สูงสุด 5MB)' });
      }
      return res.status(400).json({ error: 'อัพโหลดไฟล์ไม่สำเร็จ' });
    }
    next();
  });
};
