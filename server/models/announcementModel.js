const db = require('../config/firebaseConfig');
const refAnnouncement = db.ref('announcements');

const Announcement = {
  // Buat pengumuman baru
  create(data) {
    const newRef = refAnnouncement.push();
    return newRef.set(data).then(() => newRef.key);
  },

  // Ambil semua pengumuman
  getAll() {
    return refAnnouncement.once('value');
  },

  // Cari berdasarkan ID
  findById(id) {
    return refAnnouncement.child(id).once('value');
  },

  // Hapus pengumuman
  delete(id) {
    return refAnnouncement.child(id).remove();
  }
};

module.exports = Announcement
