const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const db = require("../db");
const path = require("path");

router.get("/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        bookings.*,
        rooms.name
      FROM bookings
      JOIN rooms
      ON bookings.room_id = rooms.id
      WHERE bookings.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    const booking = rows[0];

    // ===== PDF =====

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    // ===== FONT =====

    doc.registerFont(
      "THSarabun",
      path.join(
        __dirname,
        "../fonts/Sarabun-Regular.ttf"
      )
    );

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=receipt-${booking.id}.pdf`
    );

    doc.pipe(res);

    doc.font("THSarabun");

    // ===== HEADER =====

    doc
      .fontSize(30)
      .text("RVC HOTEL", {
        align: "center",
      });

    doc.moveDown(0.2);

    doc
      .fontSize(22)
      .text("ใบเสร็จการจอง", {
        align: "center",
      });

    doc.moveDown(2);

    // ===== DATE FORMAT =====

    const checkIn = new Date(
      booking.check_in
    ).toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
    });

    const checkOut = new Date(
      booking.check_out
    ).toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
    });

    // ===== INFO =====

    doc.fontSize(18);

    doc.text(`เลขใบเสร็จ : #${booking.id}`);

    doc.moveDown(0.5);

    doc.text(`ลูกค้า : ${booking.guest_name}`);

    doc.moveDown(0.5);

    doc.text(`ห้องพัก : ${booking.name}`);

    doc.moveDown(0.5);

    doc.text(`เช็คอิน : ${checkIn}`);

    doc.moveDown(0.5);

    doc.text(`เช็คเอาท์ : ${checkOut}`);

    doc.moveDown(0.5);

    doc.text(
      `สถานะการชำระเงิน : ${booking.payment_status}`
    );

    doc.moveDown(1.5);

    // ===== PRICE BOX =====

    doc
      .roundedRect(50, 360, 500, 80, 10)
      .stroke();

    doc
      .fontSize(22)
      .text(
        `ยอดชำระทั้งหมด : ${Number(
          booking.total_price
        ).toLocaleString()} บาท`,
        70,
        390
      );

    // ===== FOOTER =====

    doc.moveDown(4);

    doc
      .fontSize(16)
      .text(
        "ขอบคุณที่ใช้บริการ RVC HOTEL",
        {
          align: "center",
        }
      );

    doc
      .moveDown(0.3)
      .fontSize(13)
      .text(
        "เอกสารนี้ถูกสร้างอัตโนมัติจากระบบ",
        {
          align: "center",
        }
      );

    doc.end();

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Server error",
    });

  }

});

module.exports = router;