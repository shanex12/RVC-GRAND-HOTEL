const express = require('express');
const router = express.Router();
const db = require('../db');
const logActivity = require('../utils/logActivity');
const {
  verifyToken,
  allowRoles
} = require('./auth');



// ===== CREATE BOOKING =====
router.post("/", verifyToken, async (req, res) => {

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

    const checkInDateTime = check_in + " 14:00:00";
    const checkOutDateTime = check_out + " 12:00:00";

    const [conflicts] = await db.query(
      `
      SELECT id
      FROM bookings
      WHERE room_id = ?
      AND status IN ('booked', 'checked_in')
      AND (
        check_in < ?
        AND check_out > ?
      )
      `,
      [
        room_id,
        checkOutDateTime,
        checkInDateTime
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

const today = new Date();
today.setHours(0, 0, 0, 0);

const checkInDate = new Date(check_in);
const checkOutDate = new Date(check_out);

if (checkOutDate <= checkInDate) {
  return res.status(400).json({
    error: 'วันเช็คเอาท์ต้องมากกว่าวันเช็คอิน'
  });
}

if (checkInDate < today) {
  return res.status(400).json({
    error: 'ไม่สามารถจองย้อนหลังได้'
  });
}

    // ===== CHECK CREDIT =====

    const [users] = await db.query(
      `
      SELECT credit
      FROM users
      WHERE id = ?
      `,
      [req.user.id]
    );

    console.log("REQ USER =", req.user);
    console.log("USERS =", users);

    if (!users || users.length === 0) {

      return res.status(404).json({
        error: "ไม่พบ user นี้ในฐานข้อมูล"
      });

    }

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
        req.user.id
      ]
    );

    // ===== CREATE BOOKING =====

    const [result] = await db.query(
      
      `
      INSERT INTO bookings
      (
        user_id,
        guest_name,
        guest_phone,
        room_id,
        check_in,
        check_out,
        status,
        total_price
        
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        req.user.id,
        guest_name,
        guest_phone,
        room_id,
        checkInDateTime,
        checkOutDateTime,
        'booked',
        totalAmount
      ]
    );

    // ===== UPDATE ROOM =====

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

// ===== GET ACTIVE BOOKINGS =====
router.get(
  '/active',
  verifyToken,
  allowRoles('admin', 'staff'),
  async (req, res) => {
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

      res.status(500).json({
        error: 'Database error'
      });

    }
  }
);

// ===== GET BOOKING Customer =====
router.get(
  "/customer-active",
  verifyToken,
  async (req, res) => {
    try {

      const [rows] = await db.query(`
        SELECT
          room_id,
          user_id,
          check_in,
          check_out,
          status
        FROM bookings
        WHERE status IN ('booked','checked_in')
      `);

      res.json(rows);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: "Database error"
      });

    }
  }
);

// ===== CHECKIN =====
router.put(
  '/:id/checkin',
  verifyToken,
  allowRoles('admin', 'staff'),
  async (req, res) => {

    const id = req.params.id;

    try {

      const [bookingRows] = await db.query(
        `SELECT status FROM bookings WHERE id = ?`,
        [id]
      );

      if (bookingRows.length === 0) {
        return res.status(404).json({
          error: 'ไม่พบ booking'
        });
      }

      if (bookingRows[0].status !== 'booked') {
        return res.status(400).json({
          error: 'เช็คอินไม่ได้'
        });
      }

        await db.query(
          `
          UPDATE bookings
          SET
            status = ?,
            checked_in_at = NOW()
          WHERE id = ?
          `,
          ['checked_in', id]
        );

      await logActivity(
        req.user.username || req.user.role,
        `เช็คอิน booking ID ${id}`
      );

      res.json({
        message: 'Checked in'
      });

    } catch (err) {

      console.error('Checkin error:', err.message);

      res.status(500).json({
        error: 'Check-in failed'
      });

    }
  }
);

// ===== CHECKOUT =====
router.put(
  '/:id/checkout',
  verifyToken,
  allowRoles('admin', 'staff'),
  async (req, res) => {

    const id = req.params.id;

    try {

      const [bookingRows] = await db.query(
        `SELECT status FROM bookings WHERE id = ?`,
        [id]
      );

      if (bookingRows.length === 0) {
        return res.status(404).json({
          error: 'ไม่พบ booking'
        });
      }

      if (bookingRows[0].status !== 'checked_in') {
        return res.status(400).json({
          error: 'เช็คเอาท์ไม่ได้'
        });
      }

      await db.query(
        `
        UPDATE bookings
        SET
          status = ?,
          checked_out_at = NOW()
        WHERE id = ?
        `,
        ['checked_out', id]
      );

      await logActivity(
        req.user.username || req.user.role,
        `เช็คเอาท์ booking ID ${id}`
      );

      res.json({
        success: true,
        message: 'Checked out'
      });

    } catch (err) {

      console.error('Checkout error:', err.message);

      res.status(500).json({
        error: 'Checkout failed'
      });

    }
  }
);
// ===== BOOKING HISTORY =====
router.get(
  '/history',
  verifyToken,
  allowRoles('admin', 'staff'),
  async (req, res) => {

    try {

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search || '';

      const offset = (page - 1) * limit;

      const keyword = `%${search}%`;

      const [rows] = await db.query(
        `
        SELECT 
          b.*,
          r.name AS room_number,
          r.room_type
        FROM bookings b
        LEFT JOIN rooms r
        ON b.room_id = r.id
        WHERE
          b.guest_name LIKE ?
          OR b.guest_phone LIKE ?
          OR r.name LIKE ?
        ORDER BY b.id DESC
        LIMIT ?
        OFFSET ?
        `,
        [
          keyword,
          keyword,
          keyword,
          limit,
          offset
        ]
      );

      const [countRows] = await db.query(
        `
        SELECT COUNT(*) AS total
        FROM bookings b
        LEFT JOIN rooms r
        ON b.room_id = r.id
        WHERE
          b.guest_name LIKE ?
          OR b.guest_phone LIKE ?
          OR r.name LIKE ?
        `,
        [
          keyword,
          keyword,
          keyword
        ]
      );

      const total = countRows[0].total;

      res.json({
        data: rows,
        totalPages: Math.ceil(total / limit)
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: 'โหลดประวัติไม่สำเร็จ'
      });

    }

  }
);
/*===== DASHBOARD STATS ===== */
router.get(
  '/dashboard/stats',
  verifyToken,
  allowRoles('admin'),
  async (req, res) => {

  try {

    const [rooms] = await db.query(`
      SELECT COUNT(*) AS totalRooms
      FROM rooms
    `);

    const [checkedIn] = await db.query(`
      SELECT COUNT(*) AS checkedIn
      FROM bookings
      WHERE status = 'checked_in'
    `);

    const [revenue] = await db.query(`
      SELECT SUM(total_price) AS revenue
      FROM bookings
      WHERE status IN ('checked_in', 'checked_out')
    `);

    res.json({
      totalRooms: rooms[0].totalRooms || 0,
      checkedIn: checkedIn[0].checkedIn || 0,
      revenue: revenue[0].revenue || 0,
    });

  } catch (err) {

    console.error(err);
    res.status(500).json({
      message: 'โหลด dashboard ไม่สำเร็จ'
    });

  }

});

router.put("/:id/cancel", verifyToken, async (req, res) => {

  const bookingId = req.params.id;

  try {

    // หา booking
    const [rows] = await db.query(
      `
      SELECT *
      FROM bookings
      WHERE id = ?
      `,
      [bookingId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "ไม่พบรายการจอง"
      });
    }

    const booking = rows[0];

    // เช็คว่าเป็นเจ้าของ booking ไหม
    if (booking.user_id !== req.user.id) {
      return res.status(403).json({
        error: "ไม่มีสิทธิ์"
      });
    }

    if (
      booking.status === "checked_in" ||
      booking.status === "checked_out"
    ) {
      return res.status(400).json({
        error: "ไม่สามารถยกเลิกได้"
      });
    }

    // คืนเครดิต
    await db.query(
      `
      UPDATE users
      SET credit = credit + ?
      WHERE id = ?
      `,
      [
        booking.total_price,
        req.user.id
      ]
    );

    // เปลี่ยนสถานะ booking
    await db.query(
      `
      UPDATE bookings
      SET status = 'cancelled'
      WHERE id = ?
      `,
      [bookingId]
    );

    res.json({
      success: true,
      message: "ยกเลิกการจองสำเร็จ"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "ยกเลิกไม่สำเร็จ"
    });

  }

});

router.get(
  '/calendar',
  verifyToken,
  allowRoles('admin', 'staff'),
  async (req, res) => {

    try {

      const [rows] = await db.query(`
        SELECT
          b.id,
          b.room_id,
          r.name AS room_name,
          b.check_in,
          b.check_out,
          b.status
        FROM bookings b
        LEFT JOIN rooms r
        ON b.room_id = r.id
        WHERE b.status IN ('booked', 'checked_in')
      `);

      res.json(rows);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: 'โหลด calendar ไม่สำเร็จ'
      });

    }

  }
);

router.get(
  "/",
  verifyToken,
  allowRoles("admin", "staff"),
  async (req, res) => {

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
        error: "โหลด booking ไม่สำเร็จ"
      });

    }

  }
);

module.exports = router;