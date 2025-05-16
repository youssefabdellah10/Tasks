const amqp = require('amqplib');
require('dotenv').config();
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const DISH_STOCK_QUEUE = 'dishStock';
let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err.message);
    });
    connection.on('close', () => {
      console.log('RabbitMQ connection closed, attempting to reconnect...');
      setTimeout(connectRabbitMQ, 5000);
    });
    channel = await connection.createChannel();
    await channel.assertQueue(DISH_STOCK_QUEUE, {
    });
    
    console.log('Connected to RabbitMQ');
    
    return channel;
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error.message);
    console.log('Attempting to reconnect in 5 seconds...');
    setTimeout(connectRabbitMQ, 5000);
  }
};
const sendNumberToQueue = async (number) => {
  try {
    if (!channel) {
      await connectRabbitMQ();
    }
    channel.sendToQueue(DISH_STOCK_QUEUE, Buffer.from(number.toString()), {
      persistent: true 
    });
    
    console.log(`Sent number ${number} to ${DISH_STOCK_QUEUE} queue`);
    return true;
  } catch (error) {
    console.error('Error sending message to queue:', error.message);
    return false;
  }
};
connectRabbitMQ();

module.exports = {
  connectRabbitMQ,
  sendNumberToQueue,
  DISH_STOCK_QUEUE
};
