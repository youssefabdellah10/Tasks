const amqp = require('amqplib');
require('dotenv').config();
const Dish = require('../models/dish.model');
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const DISH_STOCK_QUEUE = 'dishStock';
const ORDER_EXCHANGE = 'order_exchange';
const ORDER_DETAILS_QUEUE = 'orderdetails';
const ORDER_STATUS_QUEUE = 'orderstatus';
const ORDER_ROUTING_KEY = 'order.new';
const ORDER_STATUS_ROUTING_KEY = 'order.status';
let channel = null;

// In-memory storage for processed orders
const processedOrders = new Map();

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
    
    // Setup queues and exchanges
    await channel.assertQueue(DISH_STOCK_QUEUE, { durable: true });
    await channel.assertExchange(ORDER_EXCHANGE, 'topic', { durable: true });
    await channel.assertQueue(ORDER_DETAILS_QUEUE, { durable: true });
    await channel.bindQueue(ORDER_DETAILS_QUEUE, ORDER_EXCHANGE, ORDER_ROUTING_KEY);
    await channel.assertQueue(ORDER_STATUS_QUEUE, { durable: true });
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

// Helper function to safely acknowledge messages
const safeAck = async (msg) => {
  if (!isChannelValid()) return false;
  
  try {
    channel.ack(msg);
    return true;
  } catch (ackError) {
    console.error('Error acknowledging message:', ackError.message);
    if (ackError.message.includes('Channel closed')) {
      channel = null;
      setTimeout(connectRabbitMQ, 1000);
    }
    return false;
  }
};

// Helper function to check if channel is valid
const isChannelValid = () => {
  return channel && channel.connection && channel.connection.connectionOpen;
};

const consumeOrderDetails = async () => {
  if (!isChannelValid()) return;
  
  try {
    channel.consume(ORDER_DETAILS_QUEUE, async (msg) => {
      if (msg !== null) {
        try {
          const orderData = JSON.parse(msg.content.toString());
          const { orderId, dishIds, customerUsername } = orderData;
          
          if (!orderId || !dishIds || !Array.isArray(dishIds)) {
            console.error('Invalid order data received');
            await sendNumberToQueue(-1);
            await safeAck(msg);
            return;
          }
          
          // Store order details in memory
          processedOrders.set(orderId, {
            orderId,
            dishIds,
            customerUsername,
            timestamp: new Date()
          });
          
          // Check dish availability and calculate total price
          let allAvailable = true;
          let totalPrice = 0;
          const dishQuantities = {};
          
          dishIds.forEach(dishId => {
            dishQuantities[dishId] = (dishQuantities[dishId] || 0) + 1;
          });
          
          for (const [dishId, quantity] of Object.entries(dishQuantities)) {
            try {
              const dish = await Dish.findByPk(parseInt(dishId));
              if (!dish || dish.stock < quantity) {
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
          
          await sendNumberToQueue(allAvailable ? totalPrice : -1);
          await safeAck(msg);
          
        } catch (error) {
          console.error('Error processing order:', error);
          await sendNumberToQueue(-1);
          await safeAck(msg);
        }
      }
    }, { noAck: false });
    
    console.log('Listening for order messages');
  } catch (error) {
    console.error('Error setting up consumer:', error);
    channel = null;
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
          const { orderId, status } = statusData;
          
          if (!orderId || !status) {
            console.error('Invalid order status data received');
            await safeAck(msg);
            return;
          }

          // Handle the order status update
          if (status === 'success' || status === 'completed') {
            console.log(`Payment successful for order ${orderId}, updating stock`);
            
            try {
              const orderData = await fetchOrderDetailsFromDatabase(orderId);
              
              if (!orderData || !orderData.dishIds) {
                console.log(`No order details found for order ${orderId}`);
                await safeAck(msg);
                return;
              }
              
              // Calculate quantities and update stock
              const dishQuantities = {};
              orderData.dishIds.forEach(dishId => {
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
    
    return true;
  } catch (error) {
    console.error('Error sending message to queue:', error.message);
    channel = null;
    setTimeout(connectRabbitMQ, 3000);
    return false;
  }
};

// Fetch order details from in-memory storage
const fetchOrderDetailsFromDatabase = async (orderId) => {
  return processedOrders.get(orderId) || null;
};

connectRabbitMQ();

module.exports = {
  connectRabbitMQ,
  sendNumberToQueue,
  DISH_STOCK_QUEUE,
  ORDER_EXCHANGE,
  ORDER_DETAILS_QUEUE,
  ORDER_STATUS_QUEUE,
  consumeOrderDetails,
  consumeOrderStatus
};