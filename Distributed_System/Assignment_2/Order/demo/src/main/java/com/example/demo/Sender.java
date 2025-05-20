package com.example.demo;

import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.Channel;
import com.example.demo.Models.Order;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;

@Service
public class Sender {
    // Exchange and queue configuration
    private final static String EXCHANGE_NAME = "order_exchange";
    private final static String ORDER_QUEUE_NAME = "orderdetails";
    private final static String ORDER_STATUS_QUEUE_NAME = "orderstatus";
    private final static String ORDER_noti_QUEUE_NAME = "notification";
    private final static String ORDER_ROUTING_KEY = "order.new";
    private final static String ORDER_STATUS_ROUTING_KEY = "ordersuc.status";
    private final static String ORDER_noti_ROUTING_KEY = "orders.noti";

      public void sendOrder(Order order) throws Exception {
        //Connect to RabbitMQ
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {
            
            // Declare a topic exchange
            channel.exchangeDeclare(EXCHANGE_NAME, "topic", true);
            
            // Declare the queues
            channel.queueDeclare(ORDER_QUEUE_NAME, true, false, false, null);
            
            // Bind queues to the exchange with routing key patterns
            channel.queueBind(ORDER_QUEUE_NAME, EXCHANGE_NAME, ORDER_ROUTING_KEY);
           
            
            // Convert order object to JSON
            ObjectMapper objectMapper = new ObjectMapper();
            String message = objectMapper.writeValueAsString(order);
            
            // Publish to the exchange with the order routing key
            channel.basicPublish(EXCHANGE_NAME, ORDER_ROUTING_KEY, null, message.getBytes());
            System.out.println(" [x] Sent order with ID '" + order.getOrderId() + "' to topic exchange");
        }
    }
    
    public void sendOrderStatus(Order order) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {
            
            // Declare the topic exchange
            channel.exchangeDeclare(EXCHANGE_NAME, "topic", true);
            
            // Declare the order status queue
            channel.queueDeclare(ORDER_STATUS_QUEUE_NAME, true, false, false, null);
            
            // Bind the queue to the exchange
            channel.queueBind(ORDER_STATUS_QUEUE_NAME, EXCHANGE_NAME, ORDER_STATUS_ROUTING_KEY);
              // Create an order status message (JSON)
            ObjectMapper objectMapper = new ObjectMapper();
            String message = objectMapper.writeValueAsString(
                java.util.Map.of(
                    "orderId", order.getOrderId(),
                    "status", order.getOrderStatus(), 
                    "customerUsername", order.getCustomerUsername(),
                    "dishIds", order.getDishIds(),
                    "timestamp", System.currentTimeMillis()
                )
            );
            
            // Publish to the exchange with the order status routing key
            channel.basicPublish(EXCHANGE_NAME, ORDER_STATUS_ROUTING_KEY, null, message.getBytes());
            System.out.println(" [x] Sent order status update for order '" + order.getOrderId()+ "' to topic exchange");
        }
    }     
    public void sendOrderNotification(Order order) throws Exception {
        if (order == null) {
            System.err.println("Cannot send notification for null order");
            return;
        }
        
        System.out.println("Preparing to send notification for order: " + order.getOrderId());
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {
            
            // Declare the topic exchange
            channel.exchangeDeclare(EXCHANGE_NAME, "topic", true);
            System.out.println("Exchange declared: " + EXCHANGE_NAME);
            
            // Declare the order notification queue
            channel.queueDeclare(ORDER_noti_QUEUE_NAME, true, false, false, null);
            System.out.println("Queue declared: " + ORDER_noti_QUEUE_NAME);
            
            // Bind the queue to the exchange
            channel.queueBind(ORDER_noti_QUEUE_NAME, EXCHANGE_NAME, ORDER_noti_ROUTING_KEY);
            System.out.println("Queue bound to exchange with routing key: " + ORDER_noti_ROUTING_KEY);
            
            // Create an order notification message (JSON)
            ObjectMapper objectMapper = new ObjectMapper();
            String message = objectMapper.writeValueAsString(
                java.util.Map.of(
                    "orderId", order.getOrderId(),
                    "status", order.getOrderStatus(), 
                    "Customer Name:", order.getCustomerUsername(),
                    "timestamp", System.currentTimeMillis()
                )
            );
            
            channel.basicPublish(EXCHANGE_NAME, ORDER_noti_ROUTING_KEY, null, message.getBytes());
            System.out.println(" [x] Sent order notification for order '" + order.getOrderId()+ "' to topic exchange");
            System.out.println(" [x] Message content: " + message);
        } catch (Exception e) {
            System.err.println("Error sending notification for order " + order.getOrderId() + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
