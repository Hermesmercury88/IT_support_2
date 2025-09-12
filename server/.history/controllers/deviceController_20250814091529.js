const db = require('../config/db');

// GET: ดึงอุปกรณ์ทั้งหมด
exports.getAllDevices = async (req, res) => {
  try {
    const [devices] = await db.query('SELECT * FROM devices d left join device_types dt on d.type = dt.id left join device_brand db on d.brand = db.id');
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
        *
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

// ดึงรายการ brand ทั้งหมด
exports.getAllBrands = async (req, res) => {
  try {
    const [brands] = await db.query('SELECT * FROM device_brand');
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: 'ดึงข้อมูล brand ไม่สำเร็จ', error: err.message });
  }
};

// ดึงรายการ type ทั้งหมด
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

  try {
    const [result] = await db.query('INSERT INTO devices SET ?', [cleanedFields]);
    const [newDevice] = await db.query('SELECT * FROM devices WHERE id = ?', [result.insertId]);
    res.status(201).json(newDevice[0]);
  } catch (err) {
    res.status(500).json({ message: 'ไม่สามารถเพิ่มอุปกรณ์ได้', error: err.message });
  }
};


// PUT: แก้ไขอุปกรณ์
// exports.updateDevice = async (req, res) => {
//   const id = req.params.id;
//   let {
//     name,
//     id_code,
//     brand,
//     type,
//     serial_number,
//     status,
//     location,
//   } = req.body;

//   try {
//     // ถ้า brand เป็น string ให้แปลงเป็น id
//     if (isNaN(brand)) {
//       const [brandRow] = await db.query('SELECT id FROM device_brand WHERE brand_name = ?', [brand]);
//       if (brandRow.length > 0) brand = brandRow[0].id;
//     }

//     // ถ้า type เป็น string ให้แปลงเป็น id
//     if (isNaN(type)) {
//       const [typeRow] = await db.query('SELECT id FROM device_types WHERE type_name = ?', [type]);
//       if (typeRow.length > 0) type = typeRow[0].id;
//     }

//     // อัปเดตข้อมูล
//     const sql = `
//       UPDATE devices
//       SET name = ?, id_code = ?, brand = ?, type = ?, serial_number = ?, status = ?, location = ?
//       WHERE id = ?
//     `;
//     await db.query(sql, [name, id_code, brand, type, serial_number, status, location, id]);

//     // ดึงข้อมูลอัปเดต
//     const [updated] = await db.query(`
//       SELECT 
//         d.id,
//         d.name,
//         d.id_code,
//         db.brand_name,
//         dt.type_name,
//         d.serial_number,
//         d.status,
//         d.location
//       FROM devices d
//       LEFT JOIN device_brand db ON d.brand = db.id
//       LEFT JOIN device_types dt ON d.type = dt.id
//       WHERE d.id = ?
//     `, [id]);

//     res.json(updated[0]);
//   } catch (error) {
//     console.error('Error updating device:', error);
//     res.status(500).json({ message: 'ไม่สามารถอัพเดตข้อมูลได้', error: error.message });
//   }
// };
// UPDATE device
router.put('/:id', async (req, res) => {
  try {
    const { name, id_code, brand, type, serial_number, status, location } = req.body;

    if (!brand || !type) {
      return res.status(400).json({ error: 'ต้องเลือก Brand ID และ Type ID' });
    }

    await db.query(
      `UPDATE devices
       SET name = ?, id_code = ?, brand = ?, type = ?, serial_number = ?, status = ?, location = ?
       WHERE id = ?`,
      [name, id_code, brand, type, serial_number, status, location, req.params.id]
    );

    res.json({ message: 'บันทึกสำเร็จ' });
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ error: 'ไม่สามารถอัปเดตข้อมูลได้' });
  }
});


// DELETE: ลบอุปกรณ์
// exports.deleteDevice = async (req, res) => {
//   const { id } = req.params;
//   try {
//     await db.query('DELETE FROM devices WHERE id = ?', [id]);
//     res.sendStatus(200);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Delete failed');
//   }
// };

exports.deleteDevice = async (req, res) => {
  const { id } = req.params;
  try {
    // ลบข้อมูลในตารางลูกที่อ้างถึง device_id ก่อน
    await db.query('DELETE FROM borrow_requests WHERE device_id = ?', [id]);
    await db.query('DELETE FROM borrow_history WHERE device_id = ?', [id]);

    // ค่อยลบ devices
    await db.query('DELETE FROM devices WHERE id = ?', [id]);

    res.sendStatus(200);
  } catch (err) {
    console.error('Error deleting device:', err);
    res.status(500).send('Delete failed');
  }
};
