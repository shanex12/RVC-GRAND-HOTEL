const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../db");
const logActivity = require('../utils/logActivity');
const {
  verifyToken,
  allowRoles
} = require("./auth");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post(
  "/",
  verifyToken,
  upload.single("slip"),
  async (req, res) => {

    try {
      const user_id = req.user.id;

      const { amount } = req.body;

      if (!amount || Number(amount) <= 0) {
        return res.status(400).json({
          error: "จำนวนเงินไม่ถูกต้อง"
        });
      }

      const slip_image = req.file
        ? req.file.filename
        : null;
      
      await db.query(
        `
        INSERT INTO topups
        (
          user_id,
          amount,
          slip_image,
          status
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          user_id,
          amount,
          slip_image,
          "pending",
        ]
      );

      res.json({
        success: true,
        message: "ส่งคำขอเติมเครดิตแล้ว",
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: "Server error",
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
        topups.*,
        users.username
      FROM topups
      JOIN users
      ON topups.user_id = users.id
      ORDER BY topups.id DESC
    `);

    res.json(rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error",
    });
  }
});
router.put(
  "/:id/approve",
  verifyToken,
  allowRoles("admin", "staff"),
  async (req, res) => {

  try {

    // ===== GET ADMIN FROM TOKEN =====

    const adminName = req.user.username;

    const id = req.params.id;

    const [rows] = await db.query(
      `
      SELECT * FROM topups
      WHERE id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Topup not found",
      });
    }

    const topup = rows[0];

    if (topup.status === "approved") {
      return res.status(400).json({
        error: "Already approved",
      });
    }

    await db.query(
      `
      UPDATE users
      SET credit = credit + ?
      WHERE id = ?
      `,
      [topup.amount, topup.user_id]
    );

    await db.query(
      `
      UPDATE topups
      SET status = 'approved'
      WHERE id = ?
      `,
      [id]
    );

    // ===== ACTIVITY LOG =====

    await logActivity(
      adminName,
      `อนุมัติเติมเครดิตให้ user ID ${topup.user_id} จำนวน ${topup.amount} เครดิต`
    );

    res.json({
      success: true,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error",
    });

  }

  });
router.delete(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  async (req, res) => {

  try {

    const { id } = req.params;

    await db.query(
      "DELETE FROM topups WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "ลบสลิปสำเร็จ"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "ลบสลิปไม่สำเร็จ"
    });

  }

});

// ===== MAGIC CREDIT =====
router.post(
  "/magic",
  verifyToken,
  allowRoles("admin"),
  async (req, res) => {

  try {

    console.log("BODY:", req.body);

    const adminName = req.user.username;

    const { userId, amount } = req.body;
    if (!userId || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        error: "ข้อมูลไม่ถูกต้อง"
      });
    }

    console.log(userId, amount);

    await db.query(
      `
      UPDATE users
      SET credit = credit + ?
      WHERE id = ?
      `,
      [amount, userId]
    );

    const [users] = await db.query(
      `
      SELECT username
      FROM users
      WHERE id = ?
      `,
      [userId]
    );

    console.log(users);

    const user = users[0];

    await logActivity(
      adminName,
      `เสกเครดิตให้ ${user.username} จำนวน ${amount} เครดิต`
    );

    res.json({
      success: true,
    });

  } catch (err) {

    console.error("MAGIC ERROR:", err);

    res.status(500).json({
      error: "เติมเครดิตไม่สำเร็จ",
    });

  }

});
// ===== GET MY TOPUP HISTORY =====
router.get("/my", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        id,
        amount,
        status,
        created_at
      FROM topups
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    res.json(rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "โหลดประวัติเติมเครดิตไม่สำเร็จ",
    });

  }
});

module.exports = router;