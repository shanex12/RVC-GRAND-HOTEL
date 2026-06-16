const express = require("express");
const router = express.Router();

const db = require("../db");
const { verifyToken } = require('./auth');

router.get("/", verifyToken, async (req, res) => {
  try {

    const userId = req.user.id;

    const [bookings] = await db.query(
      `
      SELECT 
        bookings.*,
        rooms.name AS room_name,
        rooms.room_type
      FROM bookings
      JOIN rooms
      ON bookings.room_id = rooms.id
      WHERE bookings.user_id = ?
      ORDER BY bookings.created_at DESC
      `,
      [userId]
    );

    res.json(bookings);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error",
    });

  }
});

module.exports = router;