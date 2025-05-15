const db = require('../config/firebaseConfig');
const refTransaksi = db.ref('transaksi');

const Transaksi = {
  // Simpan transaksi baru (harus dipanggil di halaman payment)
  create(data) {
    return refTransaksi.push(data);
  },
  // Ambil semua transaksi untuk satu userId
  findByUserId(userId) {
    // Asumsikan setiap record punya properti userId
    return refTransaksi.orderByChild('userId').equalTo(userId).once('value');
  }
};

module.exports = Transaksi;