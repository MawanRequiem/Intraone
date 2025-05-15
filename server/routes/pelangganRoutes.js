const express = require('express');
const router = express.Router();
const controller = require('../controllers/pelangganController');

// POST /api/pelanggan/register
router.post('/register', controller.registerPelanggan);

// GET /api/pelanggan/:id
router.get('/:id', controller.getPelanggan);

// POST /api/pelanggan/login
router.post('/login', controller.loginPelanggan);

router.put('/:id/langganan', controller.updateSubscription);

router.put('/:id', controller.updatePelanggan);

// DELETE /api/pelanggan/:id
router.delete('/:id', controller.deletePelanggan);

// GET semua pelanggan
router.get('/', controller.getAllPelanggan);

// DELETE pelanggan
router.delete('/:id', controller.deletePelanggan);




module.exports = router;