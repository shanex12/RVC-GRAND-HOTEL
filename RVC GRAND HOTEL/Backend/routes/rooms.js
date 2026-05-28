const express = require('express');
const router = express.Router();
const db = require('../db');
const {
  verifyToken,
  allowRoles
} = require("./auth");

// GET /api/rooms
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
    SELECT
      r.*,
      EXISTS(
        SELECT 1
        FROM bookings b
        WHERE b.room_id = r.id
        AND b.status IN ('booked', 'checked_in')
      ) AS has_booking

    FROM rooms r
    `);
    res.json(rows || []);
  } catch (err) {
    console.error('Error fetching rooms:', err.message);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// POST /api/rooms - สร้างห้องใหม่
router.post(
  '/',
  verifyToken,
  allowRoles('admin'),
  async (req, res) => {
  const { name, room_type, capacity, price, status } = req.body;

  // ตรวจสอบข้อมูล
  if (!name || !room_type || !capacity || !price || !status) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' });
  }

  try {
    // ตรวจสอบว่าห้องนี้มีอยู่แล้วหรือไม่
    const [existing] = await db.query('SELECT id FROM rooms WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'ห้องนี้มีอยู่แล้ว' });
    }

    // สร้างห้องใหม่
    const result = await db.query(
      'INSERT INTO rooms (name, room_type, capacity, price, status) VALUES (?, ?, ?, ?, ?)',
      [name, room_type, capacity, price,status]
    );

    console.log('✅ Room created:', result[0].insertId);
    res.json({ id: result[0].insertId, message: 'ห้องถูกสร้างสำเร็จ' });
  } catch (err) {
    console.error('❌ Create room error:', err.message);
    res.status(500).json({ error: 'สร้างห้องไม่สำเร็จ', details: err.message });
  }
});

// PUT /api/rooms/:id - แก้ไขห้อง
router.put(
  '/:id',
  verifyToken,
  allowRoles('admin'),
  async (req, res) => {
  const id = req.params.id;
  const {
  name,
  room_type,
  capacity,
  price,
  status
} = req.body;

  if (!name || !room_type || !capacity || !price || !status) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' });
  }

  try {
    // ตรวจสอบว่ามีห้องนี้หรือไม่
    const [rooms] = await db.query('SELECT id FROM rooms WHERE id = ?', [id]);
    if (rooms.length === 0) {
      return res.status(404).json({ error: 'ห้องไม่พบ' });
    }

    // ตรวจสอบว่าเลขห้องซ้ำ (ยกเว้นห้องปัจจุบัน)
    const [existing] = await db.query('SELECT id FROM rooms WHERE name = ? AND id != ?', [name, id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'เลขห้องนี้ใช้งานแล้ว' });
    }

    // แก้ไขห้อง
    await db.query(
      `
      UPDATE rooms
      SET
        name = ?,
        room_type = ?,
        capacity = ?,
        price = ?,
        status = ?
      WHERE id = ?
      `,
      [
        name,
        room_type,
        capacity,
        price,
        status,
        id
      ]
    );

    console.log('✅ Room updated:', id);
    res.json({ message: 'แก้ไขห้องสำเร็จ' });
  } catch (err) {
    console.error('❌ Update room error:', err.message);
    res.status(500).json({ error: 'แก้ไขห้องไม่สำเร็จ', details: err.message });
  }
});

// DELETE /api/rooms/:id - ลบห้อง
router.delete(
  '/:id',
  verifyToken,
  allowRoles('admin'),
  async (req, res) => {
  const id = req.params.id;

  try {
    // ตรวจสอบว่ามีการจองอยู่หรือไม่
  const [bookings] = await db.query(
    `
    SELECT id
    FROM bookings
    WHERE room_id = ?
    AND status IN ('booked', 'checked_in')
    `,
    [id]
  );

    if (bookings.length > 0) {
      return res.status(400).json({ error: 'ไม่สามารถลบห้องนี้ได้เพราะมีการจองอยู่' });
    }

    // ลบห้อง
    await db.query('DELETE FROM rooms WHERE id = ?', [id]);

    console.log('✅ Room deleted:', id);
    res.json({ message: 'ลบห้องสำเร็จ' });
  } catch (err) {
    console.error('❌ Delete room error:', err.message);
    res.status(500).json({ error: 'ลบห้องไม่สำเร็จ', details: err.message });
  }
});
// ===== GET AVAILABLE ROOMS =====
router.get("/available", async (req, res) => {

  const { check_in, check_out } = req.query;

  try {

    // ถ้ายังไม่เลือกวัน → ส่งเฉพาะห้องที่เปิดใช้งาน
    if (!check_in || !check_out) {

      const [rooms] = await db.query(`
        SELECT *
        FROM rooms
        WHERE status = 'available'
        ORDER BY id DESC
      `);

      return res.json(rooms);
    }

    // ห้องที่ยังว่าง
    const [rooms] = await db.query(
      `
      SELECT *
      FROM rooms
      WHERE id NOT IN (

        SELECT room_id
        FROM bookings
        WHERE status IN ('booked', 'checked_in')
        AND (
          check_in < ?
          AND check_out > ?
        )

      )
      ORDER BY id DESC
      `,
      [
        check_out,
        check_in
      ]
    );

    res.json(rooms);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "โหลดห้องว่างไม่สำเร็จ"
    });

  }

});

module.exports = router;