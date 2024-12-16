const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();

exports.subscribeToTopic = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { token, topic } = req.body;

    if (!token || !topic) {
      return res.status(400).json({ error: 'Token and topic are required.' });
    }

    try {
      await admin.messaging().subscribeToTopic(token, topic);
      return res.status(200).json({ message: `Subscribed to ${topic}` });
    } catch (error) {
      console.error('Subscription error:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});

exports.unsubscribeFromTopic = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { token, topic } = req.body;

    if (!token || !topic) {
      return res.status(400).json({ error: 'Token and topic are required.' });
    }

    try {
      await admin.messaging().unsubscribeFromTopic(token, topic);
      return res.status(200).json({ message: `Unsubscribed from ${topic}` });
    } catch (error) {
      console.error('Unsubscription error:', error);
      return res.status(500).json({ error: error.message });
    }
  });
});