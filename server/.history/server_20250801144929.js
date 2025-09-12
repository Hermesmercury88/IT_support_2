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

app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes); // ใช้ /api/devices

// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
