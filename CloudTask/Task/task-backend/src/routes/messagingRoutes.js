const express = require('express');
const router = express.Router();

const messagingController = require('../controllers/messagingController');
const notificationController = require('../controllers/notificationController');

// Topic Subscription Routes
router.post('/subscribe', messagingController.subscribeToTopic);
router.post('/unsubscribe', messagingController.unsubscribeFromTopic);
router.post('/send-topic-message', messagingController.sendTopicMessage);

// Notification Routes
router.post('/save-notification', notificationController.saveNotification);
router.get('/notifications', notificationController.getNotifications);

module.exports = router;