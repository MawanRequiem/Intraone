const db = require('../config/firebaseConfig');

const AdminModel = {
  async getAdminByEmailAndPassword(email, password) {
    try {
      const snapshot = await db.ref('admin').once('value');
      const admins = snapshot.val();

      for (const key in admins) {
        if (
          admins[key].email === email &&
          admins[key].password === password
        ) {
          return { id: key, ...admins[key] };
        }
      }
      return null;
    } catch (err) {
      throw new Error('Failed to fetch admin data');
    }
  }
};

module.exports = AdminModel;
