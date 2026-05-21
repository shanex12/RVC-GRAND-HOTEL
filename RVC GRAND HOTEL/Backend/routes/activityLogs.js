const express = require('express');
const router = express.Router();
const db = require('../db');

const {
  verifyToken,
  allowRoles
} = require("./auth");
// ดึง activity logs ทั้งหมด
router.get(
  '/',
  verifyToken,
  allowRoles("admin", "staff"),
  async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT *
      FROM activity_logs
      ORDER BY created_at DESC
    `);

    res.json(rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: 'โหลด activity logs ไม่สำเร็จ'
    });

  }
});

module.exports = router;