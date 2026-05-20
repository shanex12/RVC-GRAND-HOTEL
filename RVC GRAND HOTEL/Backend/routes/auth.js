const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


const router = express.Router();
const JWT_SECRET = 'rvc_hotel_secret_key_2026';

// Helper: Hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper: Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'รหัสผ่านไม่ตรงกัน' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
    }

    // Check if user already exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่แล้ว' });
    }

    // Create new user
    const hashedPassword = hashPassword(password);
    await db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'user']
    );

    return res.status(201).json({ 
      message: 'ลงทะเบียนสำเร็จ' 
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
    }

    // Find user
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = rows[0];
    const hashedPassword = hashPassword(password);

    if (user.password !== hashedPassword) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    // Generate token
    const token = generateToken(user);

    return res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        credit: user.credit || 0
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

// Verify token middleware
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'ไม่มี token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token ไม่ถูกต้อง' });
  }
}
function verifyAdmin(req, res, next) {

  if (!req.user) {
    return res.status(401).json({
      error: "กรุณาเข้าสู่ระบบ"
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "ไม่มีสิทธิ์"
    });
  }

  next();
}

function allowRoles(...roles) {

  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden'
      });
    }

    next();
  };
}

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, email, role, credit FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

router.get(
  '/users',
  verifyToken,
  allowRoles('admin'),
  async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, email, role, credit FROM users');
    res.json(rows || []);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

router.put(
  '/users/:id/credit',
  verifyToken,
  allowRoles('admin'),
  async (req, res) => {
  const userId = req.params.id;
  const { credit } = req.body;

  if (credit === undefined || isNaN(Number(credit))) {
    return res.status(400).json({ error: 'กรุณาระบุจำนวนเครดิตที่ถูกต้อง' });
  }

  try {
    const [existing] = await db.query('SELECT credit FROM users WHERE id = ?', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }

    const newCredit = Math.max(0, Number(existing[0].credit || 0) + Number(credit));
    await db.query('UPDATE users SET credit = ? WHERE id = ?', [newCredit, userId]);
    res.json({ id: Number(userId), credit: newCredit, message: 'เติมเครดิตเรียบร้อย' });
  } catch (err) {
    console.error('Update credit error:', err);
    res.status(500).json({ error: 'ไม่สามารถอัปเดตเครดิตได้' });
  }
});

// ===== UPDATE ROLE =====
router.put(
  '/users/:id/role',
  verifyToken,
  allowRoles('admin'),
  async (req, res) => {

    const userId = req.params.id;
    const { role } = req.body;

    if (!['admin', 'staff', 'user'].includes(role)) {
      return res.status(400).json({
        error: 'role ไม่ถูกต้อง'
      });
    }

    try {

      await db.query(
        `
        UPDATE users
        SET role = ?
        WHERE id = ?
        `,
        [role, userId]
      );

      res.json({
        success: true,
        message: 'อัปเดต role สำเร็จ'
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: 'เปลี่ยน role ไม่สำเร็จ'
      });

    }
  }
);

// ===== DELETE USER =====
router.delete(
  '/users/:id',
  verifyToken,
  allowRoles('admin'),
  async (req, res) => {

    const userId = req.params.id;

    try {

      await db.query(
        `
        DELETE FROM users
        WHERE id = ?
        `,
        [userId]
      );

      res.json({
        success: true,
        message: 'ลบผู้ใช้สำเร็จ'
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        error: 'ลบผู้ใช้ไม่สำเร็จ'
      });

    }
  }
);

module.exports = {
  router,
  verifyToken,
  verifyAdmin,
  allowRoles
};
