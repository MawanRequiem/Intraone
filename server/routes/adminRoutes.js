// routes/adminRoute.js
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');

// POST /admin/login
router.post('/login', AdminController.loginAdmin);

module.exports = router;
