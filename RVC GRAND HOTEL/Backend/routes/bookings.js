const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'rvc_hotel_secret_key_2026';
const db = require('../db');



// ===== CREATE BOOKING =====
router.post('/', async (req, res) => {

  const {
    guest_name,
    guest_phone,
    room_id,
    check_in,
    check_out
  } = req.body;

  if (!guest_name || !room_id) {
    return res.status(400).json({
      error: 'ต้องกรอกชื่อและเลือกห้อง'
    });
  }

  try {

    // ===== CHECK TOKEN =====

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'กรุณาเข้าสู่ระบบ'
      });
    }

    let decoded;

    try {

      decoded = jwt.verify(
        token,
        JWT_SECRET
      );

    } catch {

      return res.status(401).json({
        error: 'Token ไม่ถูกต้อง'
      });
    }

    // ===== CHECK ROOM =====

    const [rooms] = await db.query(
      'SELECT * FROM rooms WHERE id = ?',
      [room_id]
    );

    if (rooms.length === 0) {
      return res.status(404).json({
        error: 'ไม่พบห้อง'
      });
    }

    // ===== CHECK DATE CONFLICT =====

    const [conflicts] = await db.query(
      `
      SELECT id
      FROM bookings
      WHERE room_id = ?
      AND status != 'checked_out'
      AND (
        (check_in <= ? AND check_out > ?)
        OR
        (check_in < ? AND check_out >= ?)
        OR
        (check_in >= ? AND check_out <= ?)
      )
      `,
      [
        room_id,
        check_out,
        check_in,
        check_out,
        check_in,
        check_in,
        check_out
      ]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        error: 'ห้องนี้ถูกจองแล้ว'
      });
    }

    // ===== CALCULATE PRICE =====

    const roomPrice = Number(
      rooms[0].price
    );

    const nights = Math.max(
      1,
      Math.round(
        (
          new Date(check_out)
          -
          new Date(check_in)
        )
        /
        (1000 * 60 * 60 * 24)
      )
    );

    const totalAmount =
      roomPrice * nights;

    // ===== CHECK CREDIT =====

    const [users] = await db.query(
      `
      SELECT credit
      FROM users
      WHERE id = ?
      `,
      [decoded.id]
    );

    const userCredit = Number(
      users[0].credit || 0
    );

    if (userCredit < totalAmount) {

      return res.status(400).json({
        error: 'เครดิตไม่เพียงพอกรุณาเติมเครดิต'
      });

    }

    // ===== CUT CREDIT =====

    await db.query(
      `
      UPDATE users
      SET credit = credit - ?
      WHERE id = ?
      `,
      [
        totalAmount,
        decoded.id
      ]
    );

    // ===== CREATE BOOKING =====

    const now = new Date();

    const checkInDateTime =
      check_in + " " +
      now.toTimeString().split(" ")[0];

    const checkOutDateTime =
      check_out + " " +
      now.toTimeString().split(" ")[0];

    const [result] = await db.query(
      `
      INSERT INTO bookings
      (
        guest_name,
        guest_phone,
        room_id,
        check_in,
        check_out,
        status,
        
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        guest_name,
        guest_phone,
        room_id,
        checkInDateTime,
        checkOutDateTime,
        'booked'
      ]
    );

    // ===== UPDATE ROOM =====

    await db.query(
      `
      UPDATE rooms
      SET status = 'booked'
      WHERE id = ?
      `,
      [room_id]
    );

    res.json({
      success: true,
      id: result.insertId
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'จองไม่สำเร็จ',
      details: err.message
    });
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
// ===== BOOKING HISTORY =====
router.get('/history', async (req, res) => {

  try {

    const [rows] = await db.query(`
      SELECT 
        b.*,
        r.name AS room_number
      FROM bookings b
      LEFT JOIN rooms r
      ON b.room_id = r.id
      ORDER BY b.id DESC
    `);

    res.json(rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'โหลด history ไม่สำเร็จ'
    });
  }
});

// ===== CHECKIN =====
router.put('/:id/checkin', async (req, res) => {
  const id = req.params.id;

  try {
    await db.query(
      `
      UPDATE bookings
      SET
        status = ?,
        check_in = NOW()
      WHERE id = ?
      `,
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
      `
      UPDATE bookings
      SET
        status = ?,
        check_out = NOW()
      WHERE id = ?
      `,
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
// ===== BOOKING HISTORY =====
router.get('/history', async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT 
        b.*,
        r.name AS room_name,
        r.room_type
      FROM bookings b
      LEFT JOIN rooms r
      ON b.room_id = r.id
      ORDER BY b.id DESC
    `);

    res.json(rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'โหลดประวัติไม่สำเร็จ'
    });

  }
});

module.exports = router;