const db = require('../db');

exports.getRooms = (req, res) => {
  db.all('SELECT * FROM rooms', (err, rows) => {
    res.json(rows);
  });
};

exports.addRoom = (req, res) => {
  const { room_number, room_type, price } = req.body;

  db.run(
    'INSERT INTO rooms (room_number, room_type, price, status) VALUES (?, ?, ?, ?)',
    [room_number, room_type, price, 'available'],
    () => res.json({ message: 'Room added' })
  );
};
