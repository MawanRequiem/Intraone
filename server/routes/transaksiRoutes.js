const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiController');

// GET /api/transaksi/:userId → daftar histori transaksi
router.get('/:userId', transaksiController.getTransaksiByUser);

router.post('/', transaksiController.createTransaksi);




module.exports = router;