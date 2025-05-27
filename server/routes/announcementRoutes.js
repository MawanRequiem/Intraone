const express = require('express');
const router = express.Router();
const controller = require('../controllers/announcementController');

router.post('/', controller.createAnnouncement);
router.get('/', controller.getAllAnnouncements);
router.delete('/:id', controller.deleteAnnouncement);
router.put('/:id/statusAnnouncement', controller.updateStatus);

module.exports = router;
