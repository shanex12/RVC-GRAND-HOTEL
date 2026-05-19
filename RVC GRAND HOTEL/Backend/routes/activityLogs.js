const express = require('express');
const router = express.Router();
const db = require('../db');

// ดึง activity logs ทั้งหมด
router.get('/', async (req, res) => {
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