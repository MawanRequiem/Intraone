const db = require('../config/firebaseConfig');
const refPelanggan = db.ref('pelanggan');

const Pelanggan = {
  create(data) {
    return refPelanggan.push(data);
  },
  findById(id) {
    return refPelanggan.child(id).once('value');
  },
  update(id, data) {
    return refPelanggan.child(id).update(data);
  },
  delete(id) {
    return refPelanggan.child(id).remove();
  }
};

module.exports = Pelanggan;