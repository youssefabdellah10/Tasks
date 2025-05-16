const amqp = require('amqplib');
require('dotenv').config();
const Dish = require('../models/dish.model');

// RabbitMQ connection settings
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

// Queue names
const DISH_STOCK_QUEUE = 'dishStock';
const ORDER_EXCHANGE = 'order_exchange';
const ORDER_DETAILS_QUEUE = 'orderdetails';
const ORDER_ROUTING_KEY = 'order.new';

// Channel for RabbitMQ connection
let channel = null;

const connectRabbitMQ = async () => {
  try {
    // Create a connection
    const connection = await amqp.connect(RABBITMQ_URL);
    
    // Handle connection errors
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err.message);
    });
    
    // Handle connection close
    connection.on('close', () => {
      console.log('RabbitMQ connection closed, attempting to reconnect...');
      setTimeout(connectRabbitMQ, 5000);
    });
    
    // Create a channel
    channel = await connection.createChannel();
    
    // Set up the queues
    await channel.assertQueue(DISH_STOCK_QUEUE, {
      durable: true // Queue will survive broker restarts
    });
    
    // Set up the exchange
    await channel.assertExchange(ORDER_EXCHANGE, 'topic', {
      durable: true
    });
    
    // Set up the order details queue
    await channel.assertQueue(ORDER_DETAILS_QUEUE, {
      durable: true
    });
    
    // Bind the orderdetails queue to the exchange
    await channel.bindQueue(ORDER_DETAILS_QUEUE, ORDER_EXCHANGE, ORDER_ROUTING_KEY);
    
    // Start consuming messages from the orderdetails queue
    await consumeOrderDetails();
    
    console.log('Connected to RabbitMQ');
    
    return channel;
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error.message);
    console.log('Attempting to reconnect in 5 seconds...');
    setTimeout(connectRabbitMQ, 5000);
  }
};

// Function to consume messages from the orderdetails queue
const consumeOrderDetails = async () => {
  if (!channel) {
    await connectRabbitMQ();
    return;
  }
  
  try {
    // Consume messages from the orderdetails queue
    channel.consume(ORDER_DETAILS_QUEUE, async (msg) => {
      if (msg !== null) {
        try {
          console.log('Received order from orderdetails queue');
          
          // Parse the message content
          const orderData = JSON.parse(msg.content.toString());
          console.log('Order data:', orderData);
          
          // Extract order details
          const { orderId, dishIds, customerUsername } = orderData;
          
          if (!orderId || !dishIds || !Array.isArray(dishIds)) {
            console.error('Invalid order data received');
            // Send -1 to dishStock queue to indicate error
            await sendNumberToQueue(-1);
            // Acknowledge the message
            channel.ack(msg);
            return;
          }
          
          // Check stock availability for each dish
          let allAvailable = true;
          let totalPrice = 0;
          
          // Create a map to count occurrences of each dish
          const dishQuantities = {};
          dishIds.forEach(dishId => {
            dishQuantities[dishId] = (dishQuantities[dishId] || 0) + 1;
          });
          
          // Check availability for each unique dish
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
              
              // Add to total price
              totalPrice += dish.price * quantity;
              
            } catch (error) {
              console.error(`Error checking dish ${dishId}:`, error);
              allAvailable = false;
              break;
            }
          }
          
          // Send the result to the dishStock queue
          if (allAvailable) {
            console.log(`Order ${orderId} is valid. Total price: ${totalPrice}`);
            await sendNumberToQueue(totalPrice);
            // Update dish stock quantities
            await updateDishStock(dishIds);
          } else {
            console.log(`Order ${orderId} cannot be fulfilled due to stock issues`);
            await sendNumberToQueue(-1);
          }
          
          // Acknowledge the message
          channel.ack(msg);
          
        } catch (error) {
          console.error('Error processing order:', error);
          // Send -1 to dishStock queue to indicate error
          await sendNumberToQueue(-1);
          // Acknowledge the message to remove it from the queue
          channel.ack(msg);
        }
      }
    }, {
      // Manual acknowledgment mode
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
    
    // Convert number to string and send as buffer
    channel.sendToQueue(DISH_STOCK_QUEUE, Buffer.from(number.toString()), {
      persistent: true // Message will be saved if broker restarts
    });
    
    console.log(`Sent number ${number} to ${DISH_STOCK_QUEUE} queue`);
    return true;
  } catch (error) {
    console.error('Error sending message to queue:', error.message);
    return false;
  }
};

// Function to update dish stock quantities
const updateDishStock = async (dishIds) => {
  try {
    // Create a map to count occurrences of each dish
    const dishQuantities = {};
    dishIds.forEach(dishId => {
      dishQuantities[dishId] = (dishQuantities[dishId] || 0) + 1;
    });
    
    // Update stock for each unique dish
    for (const [dishId, quantity] of Object.entries(dishQuantities)) {
      const dish = await Dish.findByPk(parseInt(dishId));
      
      if (dish) {
        // Reduce the stock by the ordered quantity
        const newStock = Math.max(0, dish.stock - quantity);
        await Dish.update(
          { stock: newStock },
          { where: { id: parseInt(dishId) } }
        );
        
        console.log(`Updated stock for dish ${dishId}: ${dish.stock} -> ${newStock}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating dish stock:', error);
    return false;
  }
};

// Initialize connection
connectRabbitMQ();

module.exports = {
  connectRabbitMQ,
  sendNumberToQueue,
  updateDishStock,
  DISH_STOCK_QUEUE,
  ORDER_EXCHANGE,
  ORDER_DETAILS_QUEUE,
  consumeOrderDetails
};
