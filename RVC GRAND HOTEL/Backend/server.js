const express = require('express');
const cors = require('cors');
const db = require('./db');
const topupRoutes = require('./routes/topups');
const app = express();
const dashboardRoutes = require("./routes/dashboard");


app.use(cors());
app.use(express.json());
app.use('/api/topups', topupRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/dashboard', dashboardRoutes);

async function ensureDatabaseColumns() {
  try {
    const [rows] = await db.query("SHOW COLUMNS FROM users LIKE 'credit'");
    if (rows.length === 0) {
      await db.query('ALTER TABLE users ADD COLUMN credit INT DEFAULT 0');
      console.log('✅ Added credit column to users table');
    }
  } catch (err) {
    console.error('Database schema initialization error:', err.message);
  }
}

ensureDatabaseColumns();

// test route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// routes
const { router: authRouter } = require('./routes/auth');
app.use('/api/auth', authRouter);
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/bookings', require('./routes/bookings'));


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
