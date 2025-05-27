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

  // Update status satu pengumuman
updateStatus(id, status) {
  return refAnnouncement.child(id).update({ statusAnnouncement: status });
},

// Bulk update banyak field sekaligus
bulkUpdate(updates) {
  return refAnnouncement.update(updates);
},


  // Hapus pengumuman
  delete(id) {
    return refAnnouncement.child(id).remove();
  }
};

module.exports = Announcement
