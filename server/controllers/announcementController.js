const Announcement = require('../models/announcementModel');

// Tambah pengumuman
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, date } = req.body;
    const data = {
      title,
      content,
      date: date || new Date().toISOString()
    };
    const id = await Announcement.create(data);
    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Ambil semua pengumuman
exports.getAllAnnouncements = async (req, res) => {
  try {
    const snapshot = await Announcement.getAll();
    const announcements = [];

    snapshot.forEach(child => {
      announcements.push({
        id: child.key,
        ...child.val()
      });
    });

    res.json({ success: true, data: announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Hapus pengumuman
exports.deleteAnnouncement = async (req, res) => {
  try {
    const id = req.params.id;
    await Announcement.delete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
