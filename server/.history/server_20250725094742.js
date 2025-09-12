const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth'); 
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/home', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
