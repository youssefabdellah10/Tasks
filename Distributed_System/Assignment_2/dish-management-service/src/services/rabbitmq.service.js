const amqp = require('amqplib');

// Connection variables
let connection = null;
let channel = null;

// RabbitMQ configuration
const EXCHANGE_NAME = 'food_delivery';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

// Setup RabbitMQ connection
async function setupRabbitMQ() {
  try {
    // Create connection
    connection = await amqp.connect(RABBITMQ_URL);
    
    // Create channel
    channel = await connection.createChannel();
    
    // Assert exchange
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
    
    // Set up consumer queues
    await setupConsumerQueues();
    
    console.log('Connected to RabbitMQ successfully');
    
    // Handle connection closure
    connection.on('close', () => {
      console.log('RabbitMQ connection closed, attempting to reconnect...');
      setTimeout(setupRabbitMQ, 5000);
    });
    
    return { connection, channel };
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
    console.log('Application will continue without RabbitMQ functionality');
    // We're not retrying here as it will create an infinite loop of failures
    return { connection: null, channel: null };
  }
}

// Setup consumer queues
async function setupConsumerQueues() {
  try {
    // Queue for order processing
    const orderQueue = 'dish.order.queue';
    await channel.assertQueue(orderQueue, { durable: true });
    await channel.bindQueue(orderQueue, EXCHANGE_NAME, 'order.created');
    
    // Queue for payment processing
    const paymentQueue = 'dish.payment.queue';
    await channel.assertQueue(paymentQueue, { durable: true });
    await channel.bindQueue(paymentQueue, EXCHANGE_NAME, 'payment.processed');
    
    // Queue for order cancellation
    const cancelQueue = 'dish.cancel.queue';
    await channel.assertQueue(cancelQueue, { durable: true });
    await channel.bindQueue(cancelQueue, EXCHANGE_NAME, 'order.cancelled');
    
    // Consume messages from order queue
    channel.consume(orderQueue, handleOrderCreatedMessage, { noAck: false });
    
    // Consume messages from payment queue
    channel.consume(paymentQueue, handlePaymentProcessedMessage, { noAck: false });
    
    // Consume messages from cancel queue
    channel.consume(cancelQueue, handleOrderCancelledMessage, { noAck: false });
    
    console.log('RabbitMQ consumer queues set up successfully');
  } catch (error) {
    console.error('Error setting up consumer queues:', error);
    throw error;
  }
}

// Handle order created message
async function handleOrderCreatedMessage(msg) {
  try {
    const content = JSON.parse(msg.content.toString());
    console.log('Received order:', content);
    
    // Process order items and check stock
    const orderItems = content.items;
    let allItemsAvailable = true;
    let unavailableItems = [];
    
    // Import dish model here to avoid circular dependencies
    const Dish = require('../models/dish.model');
    
    // Check stock for each item
    for (const item of orderItems) {
      const dish = await Dish.findByPk(item.dishId);
      
      if (!dish || dish.stock < item.quantity) {
        allItemsAvailable = false;
        unavailableItems.push({
          dishId: item.dishId,
          requestedQuantity: item.quantity,
          availableQuantity: dish ? dish.stock : 0,
          name: dish ? dish.name : 'Unknown dish'
        });
      }
    }
    
    // Calculate total order amount to check minimum charge
    let totalOrderAmount = 0;
    if (allItemsAvailable) {
      for (const item of orderItems) {
        const dish = await Dish.findByPk(item.dishId);
        totalOrderAmount += dish.price * item.quantity;
      }
    }
    
    // Check if total meets minimum charge
    const MIN_ORDER_CHARGE = 10; // Minimum order amount
    const meetsMinimumCharge = totalOrderAmount >= MIN_ORDER_CHARGE;
    
    // Publish response based on stock availability and minimum charge
    if (allItemsAvailable && meetsMinimumCharge) {
      // Reserve stock for each item (we'll actually deduct on payment confirmation)
      const reservationIds = [];
      
      for (const item of orderItems) {
        // We don't actually deduct the stock here, just mark it as reserved
        // In a real system, you might want to implement a reservation mechanism
        // For simplicity, we'll track the order ID for now
        reservationIds.push(item.dishId);
      }
      
      // Publish stock confirmed message
      await publishMessage('dish.stock.confirmed', {
        orderId: content.orderId,
        status: 'confirmed',
        totalAmount: totalOrderAmount,
        reservationIds: reservationIds
      });
    } else {
      // Publish stock unavailable or minimum charge not met message
      const reason = !allItemsAvailable 
        ? 'Insufficient stock' 
        : 'Order does not meet minimum charge requirement';
        
      await publishMessage('dish.stock.unavailable', {
        orderId: content.orderId,
        status: 'rejected',
        reason: reason,
        unavailableItems: unavailableItems,
        minimumCharge: MIN_ORDER_CHARGE,
        orderAmount: totalOrderAmount
      });
    }
    
    // Acknowledge the message
    channel.ack(msg);
  } catch (error) {
    console.error('Error processing order message:', error);
    // Negative acknowledge and requeue the message
    channel.nack(msg, false, true);
  }
}

// Handle payment processed message
async function handlePaymentProcessedMessage(msg) {
  try {
    const content = JSON.parse(msg.content.toString());
    console.log('Received payment confirmation:', content);
    
    if (content.status === 'succeeded') {
      // Payment succeeded, deduct stock for confirmed order
      const Dish = require('../models/dish.model');
      
      // Get the original order details
      // In a real system, you might store the order details in a database
      // For simplicity, we'll assume the payment message includes order items
      const orderItems = content.orderItems;
      
      if (orderItems && orderItems.length > 0) {
        // Update stock for each item
        for (const item of orderItems) {
          const dish = await Dish.findByPk(item.dishId);
          if (dish) {
            dish.stock -= item.quantity;
            await dish.save();
          }
        }
        
        // Publish order fulfilled message
        await publishMessage('dish.order.fulfilled', {
          orderId: content.orderId,
          status: 'fulfilled',
          message: 'Stock has been updated successfully'
        });
      } else {
        console.error('Payment confirmation received without order items data');
      }
    } else {
      // Payment failed, release reserved stock
      console.log('Payment failed, releasing reserved stock');
      
      // In a real implementation, you would release the reserved stock here
      // For our simplified example, we didn't actually reserve stock in the database
      
      // Publish order cancelled message
      await publishMessage('dish.order.cancelled', {
        orderId: content.orderId,
        status: 'cancelled',
        reason: 'Payment failed'
      });
    }
    
    // Acknowledge the message
    channel.ack(msg);
  } catch (error) {
    console.error('Error processing payment message:', error);
    // Negative acknowledge and requeue the message
    channel.nack(msg, false, true);
  }
}

// Handle order cancelled message
async function handleOrderCancelledMessage(msg) {
  try {
    const content = JSON.parse(msg.content.toString());
    console.log('Received order cancellation:', content);
    
    // In a real system, you would release any reserved stock here
    // For our simplified example, we didn't actually reserve stock in the database
    
    // Acknowledge the message
    channel.ack(msg);
  } catch (error) {
    console.error('Error processing order cancellation message:', error);
    // Negative acknowledge and requeue the message
    channel.nack(msg, false, true);
  }
}

// Publish message to RabbitMQ
async function publishMessage(routingKey, message) {
  try {
    if (!channel) {
      console.log(`Cannot publish message to ${routingKey}: RabbitMQ not connected`);
      return false;
    }
    
    const success = channel.publish(
      EXCHANGE_NAME,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    
    if (success) {
      console.log(`Message published to ${routingKey}`);
      return true;
    } else {
      console.error(`Failed to publish message to ${routingKey}`);
      return false;
    }
  } catch (error) {
    console.error('Error publishing message:', error);
    throw error;
  }
}

module.exports = {
  setupRabbitMQ,
  publishMessage
};
