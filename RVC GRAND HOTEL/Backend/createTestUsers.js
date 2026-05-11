const db = require('./db');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function createTestUsers() {
  try {
    // Create admin user
    const adminPassword = hashPassword('password');
    await db.query(
      'INSERT IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@rvc.com', adminPassword, 'admin']
    );

    // Create regular user
    const userPassword = hashPassword('password');
    await db.query(
      'INSERT IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['user', 'user@rvc.com', userPassword, 'user']
    );

    console.log('✓ Test users created:');
    console.log('  Admin: admin / password');
    console.log('  User: user / password');
    process.exit(0);
  } catch (err) {
    console.error('Error creating test users:', err.message);
    process.exit(1);
  }
}

createTestUsers();
