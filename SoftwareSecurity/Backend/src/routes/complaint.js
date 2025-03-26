const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');

router.post('/submit', complaintController.submitComplaint);
router.get('/', complaintController.getComplaints);
router.get('/download/:complaintId', complaintController.downloadComplaintAttachment);

module.exports = router;