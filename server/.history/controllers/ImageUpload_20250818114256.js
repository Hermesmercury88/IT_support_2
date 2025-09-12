// const multer = require("multer");
// const path = require("path");
// const pool = require("../config/db"); // ใช้เชื่อมต่อ MySQL

// // กำหนด storage ว่าจะเก็บไฟล์ไว้ที่ไหน + ตั้งชื่อไฟล์ใหม่
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "../uploads")); // เก็บในโฟลเดอร์ uploads
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname)); // ตั้งชื่อใหม่กันซ้ำ
//   },
// });

// // filter เฉพาะไฟล์รูป
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = /jpeg|jpg|png|gif/;
//   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = allowedTypes.test(file.mimetype);

//   if (mimetype && extname) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only images are allowed (jpeg, jpg, png, gif)"));
//   }
// };

// // ตั้งค่า multer
// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
// });

// // controller สำหรับอัพโหลดรูป + บันทึกลง MySQL
// const uploadImage = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "กรุณาเลือกไฟล์" });
//     }

//     const { deviceId } = req.body; // frontend จะส่ง deviceId มาด้วย
//     const imagePath = req.file.filename; // เก็บเฉพาะชื่อไฟล์ใน DB

//     // update ตาราง devices โดยบันทึกรูปลง column image
//     await pool.query("UPDATE devices SET image = ? WHERE id = ?", [
//       imagePath,
//       deviceId,
//     ]);

//     res.json({
//       message: "อัพโหลดสำเร็จ",
//       filename: imagePath,
//       url: `/uploads/${imagePath}`,
//     });
//   } catch (err) {
//     console.error("Upload error:", err);
//     res.status(500).json({ message: "อัพโหลดไม่สำเร็จ", error: err.message });
//   }
// };

// module.exports = {
//   upload,
//   uploadImage,
// };
