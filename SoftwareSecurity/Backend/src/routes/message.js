const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.post('/send', messageController.sendMessage);
router.get('/', messageController.getMessages);
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;