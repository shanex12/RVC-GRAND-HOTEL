const db = require('../db');

async function logActivity(adminName, action) {

  try {

    await db.query(
      `
      INSERT INTO activity_logs
      (admin_name, action)
      VALUES (?, ?)
      `,
      [adminName, action]
    );

  } catch (err) {

    console.error(
      'Log activity error:',
      err.message
    );

  }

}

module.exports = logActivity;