const db = require('../config/firebaseConfig');
const refTemp = db.ref('tempTransaksi');

const TempTransaksi = {
  // Simpan data sementara
  create(data) {
    return refTemp.push(data);
  },
  // Ambil satu temp transaksi
  findById(id) {
    return refTemp.child(id).once('value');
  },
  // Hapus data sementara setelah confirm
  delete(id) {
    return refTemp.child(id).remove();
  }
};

module.exports = TempTransaksi;
