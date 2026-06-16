const db = require('../db');

exports.createBooking = (req, res) => {
  const { guest_name, phone, room_id, checkin_date, checkout_date } = req.body;

  db.run(
    `INSERT INTO bookings 
    (guest_name, phone, room_id, checkin_date, checkout_date, status)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [guest_name, phone, room_id, checkin_date, checkout_date, 'booked'],
    () => res.json({ message: 'Booking created' })
  );
};

exports.checkIn = (req, res) => {
  const time = new Date().toISOString();

  db.run(
    `UPDATE bookings SET status=?, checkin_time=? WHERE id=?`,
    ['checked_in', time, req.params.id],
    () => res.json({ message: 'Checked in' })
  );
};

exports.checkOut = (req, res) => {
  const time = new Date().toISOString();

  db.run(
    `UPDATE bookings SET status=?, checkout_time=? WHERE id=?`,
    ['checked_out', time, req.params.id],
    () => res.json({ message: 'Checked out' })
  );
};
