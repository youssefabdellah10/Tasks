const amqp = require('amqplib');
require('dotenv').config();
const Dish = require('../models/dish.model');
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const DISH_STOCK_QUEUE = 'dishStock';
const ORDER_EXCHANGE = 'order_exchange';
const ORDER_DETAILS_QUEUE = 'orderdetails';
const ORDER_ROUTING_KEY = 'order.new';
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
      durable: true
    });
    await channel.assertExchange(ORDER_EXCHANGE, 'topic', {
      durable: true
    });
    await channel.assertQueue(ORDER_DETAILS_QUEUE, {
      durable: true
    });
    await channel.bindQueue(ORDER_DETAILS_QUEUE, ORDER_EXCHANGE, ORDER_ROUTING_KEY);
    console.log('Channel setup complete, ready to consume messages');
    
    console.log('Connected to RabbitMQ')
    await consumeOrderDetails();
    
    return channel;
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error.message);
    console.log('Attempting to reconnect in 5 seconds...');
    setTimeout(connectRabbitMQ, 5000);
  }
};

const consumeOrderDetails = async () => {
  if (!channel) {
    console.log('No channel available for consuming messages');
    return;
  }
  
  try {
    channel.consume(ORDER_DETAILS_QUEUE, async (msg) => {
      if (msg !== null) {
        try {
          console.log('Received order from orderdetails queue');
          const orderData = JSON.parse(msg.content.toString());
          console.log('Order data:', orderData);
          const { orderId, dishIds, customerUsername } = orderData;
          
          if (!orderId || !dishIds || !Array.isArray(dishIds)) {
            console.error('Invalid order data received');
            await sendNumberToQueue(-1);
            channel.ack(msg);
            return;
          }
          let allAvailable = true;
          let totalPrice = 0;
          const dishQuantities = {};
          dishIds.forEach(dishId => {
            dishQuantities[dishId] = (dishQuantities[dishId] || 0) + 1;
          });
          for (const [dishId, quantity] of Object.entries(dishQuantities)) {
            try {
              const dish = await Dish.findByPk(parseInt(dishId));
              if (!dish) {
                console.log(`Dish with ID ${dishId} not found`);
                allAvailable = false;
                break;
              }
              if (dish.stock < quantity) {
                console.log(`Insufficient stock for dish ${dishId}: requested ${quantity}, available ${dish.stock}`);
                allAvailable = false;
                break;
              }
              totalPrice += dish.price * quantity;
              
            } catch (error) {
              console.error(`Error checking dish ${dishId}:`, error);
              allAvailable = false;
              break;
            }
          }
          if (allAvailable) {
            console.log(`Order ${orderId} is valid. Total price: ${totalPrice}`);
            await sendNumberToQueue(totalPrice);
          } else {
            console.log(`Order ${orderId} cannot be fulfilled due to stock issues`);
            await sendNumberToQueue(-1);
          }
          channel.ack(msg);
          
        } catch (error) {
          console.error('Error processing order:', error);
          await sendNumberToQueue(-1);
          channel.ack(msg);
        }
      }
    }, {
      noAck: false
    });
    
    console.log('Listening for order messages...');
  } catch (error) {
    console.error('Error setting up consumer:', error);
    setTimeout(consumeOrderDetails, 5000);
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
  DISH_STOCK_QUEUE,
  ORDER_EXCHANGE,
  ORDER_DETAILS_QUEUE,
  consumeOrderDetails
};
