const TempTransaksi = require('../models/tempTransaksiModel');

// POST /api/tempTransaksi → buat data sementara
exports.createTemp = async (req, res) => {
  try {
    const data = req.body;
    const newRef = TempTransaksi.create(data);
    res.status(201).json({ tempId: newRef.key });
  } catch (err) {
    console.error('Gagal simpan temp transaksi:', err);
    res.status(500).json({ error: 'Gagal simpan temp transaksi.' });
  }
};

// GET /api/tempTransaksi/:id → baca detail sementara
exports.getTempById = async (req, res) => {
  try {
    const { id } = req.params;
    const snap = await TempTransaksi.findById(id);
    if (!snap.exists()) return res.status(404).json({ error: 'Data temp tidak ditemukan.' });
    res.json({ id, ...snap.val() });
  } catch (err) {
    console.error('Gagal ambil temp transaksi:', err);
    res.status(500).json({ error: 'Gagal ambil temp transaksi.' });
  }
};

// DELETE /api/tempTransaksi/:id → hapus setelah dipindah
exports.deleteTemp = async (req, res) => {
  try {
    await TempTransaksi.delete(req.params.id);
    res.json({ message: 'Temp transaksi dihapus.' });
  } catch (err) {
    console.error('Gagal hapus temp transaksi:', err);
    res.status(500).json({ error: 'Gagal hapus temp transaksi.' });
  }
};
