const Transaksi = require('../models/transaksiModel');

exports.getTransaksiByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await Transaksi.findByUserId(userId);
    const data = snapshot.val() || {};

    // Ubah object { id: {...}, id2: {...} } jadi array
    const daftar = Object.entries(data).map(([id, val]) => ({
      id,
      ...val
    }));

    res.status(200).json(daftar);
  } catch (err) {
    console.error('Error fetching transaksi:', err);
    res.status(500).json({ error: 'Gagal mengambil riwayat transaksi.' });
  }
};

// POST /api/transaksi → buat transaksi baru
const { create } = require('../models/transaksiModel');

exports.createTransaksi = async (req, res) => {
  try {
    const data = req.body;
    if (!data.userId || !data.tanggal) {
      return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    await create(data); // fungsi create ini sesuai DAO kamu
    res.status(201).json({ message: 'Transaksi berhasil disimpan.' });
  } catch (err) {
    console.error("Gagal menyimpan transaksi:", err);
    res.status(500).json({ error: 'Gagal menyimpan transaksi.' });
  }
};
