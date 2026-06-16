const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/stats", async (req, res) => {

  try {

    // รายได้วันนี้
    const [todayRevenue] = await db.query(`
      SELECT SUM(total_price) AS total
      FROM bookings
      WHERE DATE(created_at) = CURDATE()
      AND status IN ('checked_in', 'checked_out')
    `);

    // รายได้เดือนนี้
    const [monthRevenue] = await db.query(`
      SELECT SUM(total_price) AS total
      FROM bookings
      WHERE MONTH(created_at) = MONTH(CURDATE())
      AND YEAR(created_at) = YEAR(CURDATE())
      AND status IN ('checked_in', 'checked_out')
    `);

    // ห้องว่าง
    const [availableRooms] = await db.query(`
      SELECT COUNT(*) AS total
      FROM rooms
      WHERE status = 'available'
    `);

    // คนเข้าพัก
    const [checkedIn] = await db.query(`
      SELECT COUNT(*) AS total
      FROM bookings
      WHERE status = 'checked_in'
    `);

    res.json({
      todayRevenue: todayRevenue[0].total || 0,
      monthRevenue: monthRevenue[0].total || 0,
      availableRooms: availableRooms[0].total || 0,
      checkedIn: checkedIn[0].total || 0,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "โหลด dashboard ไม่สำเร็จ"
    });

  }

});

router.get('/dashboard-stats', async (req, res) => {

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
    SELECT SUM(total_price) AS usedCredit
    FROM bookings
    `);

    res.json({
      totalRooms: rooms[0].totalRooms || 0,
      checkedIn: checkedIn[0].checkedIn || 0,
      usedCredit: revenue[0].usedCredit || 0,
    });

  } catch (err) {

    console.error(err);
    res.status(500).json({
      message: 'โหลด dashboard ไม่สำเร็จ'
    });

  }

});
module.exports = router;