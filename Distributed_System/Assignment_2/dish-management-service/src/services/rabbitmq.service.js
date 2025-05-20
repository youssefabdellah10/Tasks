const amqp = require('amqplib');
require('dotenv').config();
const Dish = require('../models/dish.model');
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const DISH_STOCK_QUEUE = 'dishStock';
const ORDER_EXCHANGE = 'order_exchange';
const ORDER_DETAILS_QUEUE = 'orderdetails';
const ORDER_ROUTING_KEY = 'order.new';
const ORDER_STATUS_QUEUE = 'orderstatus';
const ORDER_STATUS_ROUTING_KEY = 'ordersuc.status';
let channel = null;

const isChannelValid = () => {
  return channel && channel.connection && 
  typeof channel.publish === 'function' && 
  typeof channel.consume === 'function';
};

const connectRabbitMQ = async () => {
  try {
    if (isChannelValid()) {
      return channel;
    }
    
    const connection = await amqp.connect(RABBITMQ_URL);
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err.message);
      channel = null;
    });
    connection.on('close', () => {
      console.log('RabbitMQ connection closed, attempting to reconnect...');
      channel = null;
      setTimeout(connectRabbitMQ, 5000);
    });
    
    channel = await connection.createChannel();
    channel.on('error', (err) => {
      console.error('Channel error:', err.message);
      channel = null;
    });
    
    channel.on('close', () => {
      channel = null;
    });
    
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
    
    // Set up the order status queue and binding
    await channel.assertQueue(ORDER_STATUS_QUEUE, {
      durable: true
    });
    await channel.bindQueue(ORDER_STATUS_QUEUE, ORDER_EXCHANGE, ORDER_STATUS_ROUTING_KEY);
    
    console.log('Connected to RabbitMQ');
    await consumeOrderDetails();
    await consumeOrderStatus();
    
    return channel;
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error.message);
    channel = null;
    setTimeout(connectRabbitMQ, 5000);
    return null;
  }
};

const consumeOrderDetails = async () => {
  if (!isChannelValid()) {
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

const consumeOrderStatus = async () => {
  if (!isChannelValid()) return;
  
  try {
    channel.consume(ORDER_STATUS_QUEUE, async (msg) => {      
      if (msg !== null) {
        try {
          const statusData = JSON.parse(msg.content.toString());
          console.log('Received order status message:', JSON.stringify(statusData));
          const { orderId, status } = statusData;
          
          if (!orderId || !status) {
            console.error('Invalid order status data received');
            await safeAck(msg);
            return;
          }
          if (status === 'completed,paid successfully') {
            console.log(`Payment successful for order ${orderId}, updating stock`);
            
            try {
              const dishIds = statusData.dishIds || [];
              
              if (!dishIds || dishIds.length === 0) {
                console.log(`No dish details found for order ${orderId}`);
                await safeAck(msg);
                return;
              }
              console.log(`Found ${dishIds.length} dishes for order ${orderId}`);
              const dishQuantities = {};
              dishIds.forEach(dishId => {
                dishQuantities[dishId] = (dishQuantities[dishId] || 0) + 1;
              });
              
              for (const [dishId, quantity] of Object.entries(dishQuantities)) {
                try {
                  const dish = await Dish.findByPk(parseInt(dishId));
                  if (!dish) continue;
                  
                  const newStock = Math.max(0, dish.stock - quantity);
                  await dish.update({ stock: newStock });
                  console.log(`Updated stock for dish ${dishId}: ${dish.stock} → ${newStock}`);
                } catch (error) {
                  console.error(`Error updating stock for dish ${dishId}:`, error);
                }
              }
            } catch (error) {
              console.error(`Error updating stock for order ${orderId}:`, error);
            }
          }
          
          await safeAck(msg);
        } catch (error) {
          console.error('Error processing order status:', error);
          await safeAck(msg);
        }
      }
    }, { noAck: false });
    
    console.log('Listening for order status messages');
  } catch (error) {
    console.error('Error setting up order status consumer:', error);
    channel = null;
    setTimeout(consumeOrderStatus, 5000);
  }
};

const sendNumberToQueue = async (number) => {
  try {
    if (!isChannelValid()) {
      await connectRabbitMQ();
      if (!channel) {
        throw new Error('Failed to establish a valid channel');
      }
    }
    
    channel.sendToQueue(DISH_STOCK_QUEUE, Buffer.from(number.toString()), {
      persistent: true 
    });
    
    console.log(`Sent number ${number} to ${DISH_STOCK_QUEUE} queue`);
    return true;
  } catch (error) {
    console.error('Error sending message to queue:', error.message);
    channel = null;
    setTimeout(connectRabbitMQ, 3000);
    return false;
  }
};

const safeAck = async (msg) => {
  try {
    if (isChannelValid() && msg) {
      channel.ack(msg);
    }
  } catch (error) {
    console.error('Error acknowledging message:', error);
  }
};

connectRabbitMQ();

module.exports = {
  connectRabbitMQ,
  sendNumberToQueue,
  DISH_STOCK_QUEUE,
  ORDER_EXCHANGE,
  ORDER_DETAILS_QUEUE,
  ORDER_STATUS_QUEUE,
  ORDER_STATUS_ROUTING_KEY
};
