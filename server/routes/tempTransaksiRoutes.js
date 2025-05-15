const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tempTransaksiController');

router.post('/',   ctrl.createTemp);     // buat temp
router.get('/:id', ctrl.getTempById);    // baca temp
router.delete('/:id', ctrl.deleteTemp);  // hapus temp

module.exports = router;
