const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const db = require("../db");


const JWT_SECRET = "rvc_hotel_secret_key_2026";

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
  upload.single("slip"),
  async (req, res) => {

    try {

      const token =
        req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const decoded = jwt.verify(
        token,
        JWT_SECRET
      );

      const user_id = decoded.id;

      const { amount } = req.body;

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
router.get("/", async (req, res) => {

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
router.put("/:id/approve", async (req, res) => {

  try {

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

    res.json({
      success: true,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error",
    });
  }
  router.delete("/:id", async (req, res) => {

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
});

module.exports = router;