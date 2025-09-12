const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const borrowRoutes = require('./routes/borrowRoutes');
const returnRoutes = require('./routes/returnRoutes');
const borrowHistoryRoutes = require('./routes/borrowHistory');
const deviceTypesRoutes = require('./routes/deviceTypes');
const brandRoutes = require('./routes/brandRoutes'); //  เพิ่ม import
const imageRoutes = require("./routes/imageRoutes");
// const requestRoutes = require('./routes/requestRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes); 
app.use('/api', borrowRoutes);
app.use('/api', returnRoutes);
app.use('/api/borrow-history', borrowHistoryRoutes);
app.use('/api/device-types', deviceTypesRoutes);
app.use('/api/brands', brandRoutes); 
app.use("/api/upload", imageRoutes);
app.use('/uploads', express.static('uploads'));

// app.use('/api/borrow-requests', borrowRoutes);
// app.use('/api', requestRoutes);



// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
