const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'rvc_hotel_secret_key_2026';

// ===== CREATE BOOKING =====
router.post('/', async (req, res) => {
const { guest_name, room_id, check_in, check_out, payment_method } = req.body;

  if (!guest_name || !room_id) {
    return res.status(400).json({ error: 'ต้องกรอกชื่อและเลือกห้อง' });
  }

  try {
    // ตรวจสอบว่าห้องว่างหรือไม่
    const [rooms] = await db.query(
      'SELECT status FROM rooms WHERE id = ?',
      [room_id]
    );

    if (rooms.length === 0) {
      return res.status(404).json({ error: 'ห้องไม่พบในระบบ' });
    }

    // ถ้ามีวันที่ ตรวจสอบการจองที่ชนกัน
    if (check_in && check_out) {
      const [conflicts] = await db.query(
        `SELECT id FROM bookings 
         WHERE room_id = ? 
         AND status != 'checked_out'
         AND (
           (check_in <= ? AND check_out > ?) OR
           (check_in < ? AND check_out >= ?) OR
           (check_in >= ? AND check_out <= ?)
         )`,
        [room_id, check_out, check_in, check_out, check_in, check_in, check_out]
      );

      if (conflicts.length > 0) {
        return res.status(400).json({ error: 'ห้องนี้ถูกจองในช่วงวันที่ระบุแล้ว' });
      }
    }

    const [roomRows] = await db.query('SELECT price FROM rooms WHERE id = ?', [room_id]);
    if (roomRows.length === 0) {
      return res.status(404).json({ error: 'ห้องไม่พบในระบบ' });
    }
    const roomPrice = roomRows[0].price;
    const nights = check_in && check_out ? Math.max(1, Math.round((new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24))) : 1;
    const totalAmount = roomPrice * nights;

    if (payment_method === 'credit') {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'ต้องเข้าสู่ระบบเพื่อใช้เครดิต' });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (tokenErr) {
        return res.status(401).json({ error: 'Token ไม่ถูกต้อง' });
      }

      const userId = decoded.id;
      const [userRows] = await db.query('SELECT credit FROM users WHERE id = ?', [userId]);
      if (userRows.length === 0) {
        return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
      }
      const currentCredit = Number(userRows[0].credit || 0);
      if (currentCredit < totalAmount) {
        return res.status(400).json({ error: 'เครดิตไม่เพียงพอ' });
      }
      await db.query('UPDATE users SET credit = ? WHERE id = ?', [currentCredit - totalAmount, userId]);
    }

    // สร้าง booking
    const result = await db.query(
      `INSERT INTO bookings (guest_name, room_id, check_in, check_out, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [guest_name, room_id, check_in || null, check_out || null, 'booked']
    );

    // อัพเดท status ห้องเป็น occupied
    await db.query(
      'UPDATE rooms SET status = ? WHERE id = ?',
      ['occupied', room_id]
    );

    console.log('✅ Booking created:', result[0].insertId);
    res.json({ id: result[0].insertId, message: 'Booking created' });
  } catch (err) {
    console.error('❌ Create booking error:', err);
    if (err && err.stack) console.error(err.stack);
    res.status(500).json({ error: 'จองไม่สำเร็จ', details: err.message || 'เกิดข้อผิดพลาด' });
  }
});

// ===== GET ALL BOOKINGS =====
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM bookings');
    res.json(rows || []);
  } catch (err) {
    console.error('Get bookings error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// ===== GET ACTIVE BOOKINGS (booked + checked_in) =====
router.get('/active', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.*, r.name AS room_number, r.room_type
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.status IN ('booked', 'checked_in')
      ORDER BY b.id DESC
    `);
    res.json(rows || []);
  } catch (err) {
    console.error('Active bookings error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// ===== CHECKIN =====
router.put('/:id/checkin', async (req, res) => {
  const id = req.params.id;

  try {
    await db.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['checked_in', id]
    );
    res.json({ message: 'Checked in' });
  } catch (err) {
    console.error('Checkin error:', err.message);
    res.status(500).json({ error: 'Check-in failed' });
  }
});

// ===== CHECKOUT =====
router.put('/:id/checkout', async (req, res) => {
  const id = req.params.id;

  try {
    // ได้ room_id จาก booking
    const [bookings] = await db.query(
      'SELECT room_id FROM bookings WHERE id = ?',
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const roomId = bookings[0].room_id;

    // อัพเดท booking status
    await db.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['checked_out', id]
    );

    // อัพเดท room status เป็น available
    await db.query(
      'UPDATE rooms SET status = ? WHERE id = ?',
      ['available', roomId]
    );

    res.json({ success: true, message: 'Checked out' });
  } catch (err) {
    console.error('Checkout error:', err.message);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

module.exports = router;