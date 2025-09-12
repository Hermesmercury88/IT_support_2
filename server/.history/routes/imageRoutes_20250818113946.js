const express = require("express");
const router = express.Router();
const { upload, uploadImage } = require("../controllers/ImageUpload");

// POST /api/upload
router.post("/", upload.single("image"), uploadImage);

module.exports = router;
