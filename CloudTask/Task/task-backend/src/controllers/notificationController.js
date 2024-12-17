const { firestore } = require('../config/firebase');

class NotificationController {
  // Save notification to Firestore
  async saveNotification(req, res) {
    try {
      const { data, notification } = req.body;

      if (!data && !notification) {
        return res.status(400).json({ 
          error: 'At least one of data or notification payload is required' 
        });
      }

      const notificationRef = firestore.collection('notifications');
      const savedNotification = await notificationRef.add({
        data: data || {},
        notification: notification || {},
        timestamp: firestore.FieldValue.serverTimestamp()
      });

      res.status(200).json({ 
        message: 'Notification saved successfully', 
        id: savedNotification.id 
      });
    } catch (error) {
      console.error('Error saving notification:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        details: error.message 
      });
    }
  }

  // Retrieve notifications
  async getNotifications(req, res) {
    try {
      const { limit = 50, offset = 0 } = req.query;

      const notificationsRef = firestore.collection('notifications');
      const snapshot = await notificationsRef
        .orderBy('timestamp', 'desc')
        .limit(Number(limit))
        .offset(Number(offset))
        .get();

      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.status(200).json({
        notifications,
        count: notifications.length
      });
    } catch (error) {
      console.error('Error retrieving notifications:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        details: error.message 
      });
    }
  }
}

module.exports = new NotificationController();