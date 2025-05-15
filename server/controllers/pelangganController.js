const Pelanggan = require('../models/pelangganModel');

exports.registerPelanggan = async (req, res) => {
  try {
    const { nama, noHP, email, durasiBerlangganan, ...rest } = req.body;
    if (!nama || !noHP || !email || !durasiBerlangganan) {
      return res.status(400).json({
        error: 'Field nama, noHP, email, dan durasiBerlangganan wajib diisi.'
      });
    }

    // Hitung tanggal mulai & tenggat
    const subscriptionDate = new Date();
    const expiryDate = new Date(subscriptionDate);
    expiryDate.setMonth(expiryDate.getMonth() + Number(durasiBerlangganan));

    const dataToSave = {
      nama,
      noHP,
      email,
      durasiBerlangganan: Number(durasiBerlangganan),
      subscriptionDate: subscriptionDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      status: 'pending',
      ...rest
    };

    const newRef = await Pelanggan.create(dataToSave);
    res.status(201).json({
      message: 'Registrasi berhasil.',
      id: newRef.key,
      subscriptionDate: dataToSave.subscriptionDate,
      expiryDate: dataToSave.expiryDate
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mendaftar pelanggan.' });
  }
};

exports.getPelanggan = async (req, res) => {
  try {
    const snapshot = await Pelanggan.findById(req.params.id);
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Pelanggan tidak ditemukan.' });
    }
    res.json(snapshot.val());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data pelanggan.' });
  }
};

exports.loginPelanggan = async (req, res) => {
  try {
    const { email, noHP } = req.body;
    if (!email || !noHP) {
      return res.status(400).json({ error: 'Email dan nomor HP wajib diisi' });
    }

    const db = require('../config/firebaseConfig');
    const snapshot = await db.ref('pelanggan').once('value');
    const data = snapshot.val();

    const pelanggan = Object.entries(data || {}).find(([id, val]) =>
      val.email === email && val.noHP === noHP
    );

    if (!pelanggan) {
      return res.status(401).json({ error: 'Email atau nomor HP salah' });
    }

    const [id, userData] = pelanggan;
    res.json({ message: 'Login berhasil', id, data: userData });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server saat login' });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { durasi } = req.body;

    const snapshot = await Pelanggan.findById(id);
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Pelanggan tidak ditemukan.' });
    }

    const pelanggan = snapshot.val();
    const oldExpiry = new Date(pelanggan.expiryDate);
    const newExpiry = new Date(oldExpiry);
    newExpiry.setMonth(newExpiry.getMonth() + Number(durasi));

    await Pelanggan.update(id, { expiryDate: newExpiry.toISOString() });

    res.status(200).json({ message: 'Berhasil update masa langganan.', newExpiry: newExpiry.toISOString() });
  } catch (err) {
    console.error('Gagal update langganan:', err);
    res.status(500).json({ error: 'Gagal update masa langganan.' });
  }
};

exports.updatePelanggan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const snapshot = await Pelanggan.findById(id);
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Pelanggan tidak ditemukan.' });
    }

    await Pelanggan.update(id, updateData);
    res.status(200).json({ message: 'Data pelanggan berhasil diperbarui.', updateData });
  } catch (err) {
    console.error('Gagal memperbarui pelanggan:', err);
    res.status(500).json({ error: 'Gagal memperbarui pelanggan.' });
  }
};


exports.deletePelanggan = async (req, res) => {
  try {
    const { id } = req.params;

    const snapshot = await Pelanggan.findById(id);
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Pelanggan tidak ditemukan.' });
    }

    await Pelanggan.delete(id);
    res.status(200).json({ message: 'Pelanggan berhasil dihapus.' });
  } catch (err) {
    console.error('Gagal menghapus pelanggan:', err);
    res.status(500).json({ error: 'Gagal menghapus pelanggan.' });
  }
};

// Ambil semua pelanggan
exports.getAllPelanggan = async (req, res) => {
  try {
    const db = require('../config/firebaseConfig');
    const snapshot = await db.ref('pelanggan').once('value');
    res.status(200).json(snapshot.val());
  } catch (err) {
    console.error('Gagal ambil semua pelanggan:', err);
    res.status(500).json({ error: 'Gagal mengambil data pelanggan.' });
  }
};

// Hapus pelanggan berdasarkan ID
exports.deletePelanggan = async (req, res) => {
  try {
    const db = require('../config/firebaseConfig');
    const { id } = req.params;
    await db.ref(`pelanggan/${id}`).remove();
    res.status(200).json({ message: 'Pelanggan berhasil dihapus' });
  } catch (err) {
    console.error('Gagal menghapus pelanggan:', err);
    res.status(500).json({ error: 'Gagal menghapus pelanggan.' });
  }
};
