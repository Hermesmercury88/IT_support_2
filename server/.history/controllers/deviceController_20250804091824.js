const db = require('../config/db');

exports.getAllDevices = async (req, res) => {
  try {
    const [devices] = await db.query('SELECT * FROM devices');
    res.json(devices);
  } catch (err) {
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์', error: err.message });
  }
};

// PUT แก้ไขอุปกรณ์
router.put('/devices/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  try {
    await db.query('UPDATE devices SET ? WHERE id = ?', [fields, id]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Update failed');
  }
});

// DELETE ลบอุปกรณ์
router.delete('/devices/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM devices WHERE id = ?', [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send('Delete failed');
  }
});
