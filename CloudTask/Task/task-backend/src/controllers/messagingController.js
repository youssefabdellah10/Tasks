const { admin, messaging, firestore } = require('../config/firebase');

class MessagingController {
  // Subscribe to a topic
  async subscribeToTopic(req, res) {
    try {
      const { token, topic } = req.body;

      if (!token || !topic) {
        return res.status(400).json({ 
          error: 'Token and topic are required' 
        });
      }

      const response = await messaging.subscribeToTopic(token, topic);

      if (response.failureCount > 0) {
        const errors = response.errors.map(err => err.reason);
        return res.status(500).json({ 
          error: 'Subscription failed', 
          details: errors 
        });
      }

      res.status(200).json({ 
        message: `Successfully subscribed to topic: ${topic}` 
      });
    } catch (error) {
      console.error('Subscription error:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        details: error.message 
      });
    }
  }

  // Unsubscribe from a topic
  async unsubscribeFromTopic(req, res) {
    try {
      const { token, topic } = req.body;

      if (!token || !topic) {
        return res.status(400).json({ 
          error: 'Token and topic are required' 
        });
      }

      const response = await messaging.unsubscribeFromTopic(token, topic);

      if (response.failureCount > 0) {
        const errors = response.errors.map(err => err.reason);
        return res.status(500).json({ 
          error: 'Unsubscription failed', 
          details: errors 
        });
      }

      res.status(200).json({ 
        message: `Successfully unsubscribed from topic: ${topic}` 
      });
    } catch (error) {
      console.error('Unsubscription error:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        details: error.message 
      });
    }
  }

  // Send message to a topic
  async sendTopicMessage(req, res) {
    try {
      const { topic, title, body, data } = req.body;

      if (!topic || !title || !body) {
        return res.status(400).json({ 
          error: 'Topic, title, and body are required' 
        });
      }

      const message = {
        notification: {
          title,
          body
        },
        data: data || {},
        topic: topic
      };

      const response = await messaging.send(message);

      res.status(200).json({ 
        message: 'Message sent successfully', 
        messageId: response 
      });
    } catch (error) {
      console.error('Message sending error:', error);
      res.status(500).json({ 
        error: 'Internal server error', 
        details: error.message 
      });
    }
  }
}

module.exports = new MessagingController();