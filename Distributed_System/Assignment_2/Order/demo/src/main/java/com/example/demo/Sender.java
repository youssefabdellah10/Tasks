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
    private final static String PAYMENT_QUEUE_NAME = "paymentstatus";
    private final static String ORDER_STATUS_QUEUE_NAME = "orderstatus";
    private final static String ORDER_ROUTING_KEY = "order.new";
    private final static String PAYMENT_ROUTING_KEY = "payment.status";
    private final static String ORDER_STATUS_ROUTING_KEY = "order.status";
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
            channel.queueDeclare(PAYMENT_QUEUE_NAME, true, false, false, null);
            
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
    
    public void sendPaymentStatus(Order order) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {
            
            // Declare the topic exchange
            channel.exchangeDeclare(EXCHANGE_NAME, "topic", true);
            
            // Declare the payment queue
            channel.queueDeclare(PAYMENT_QUEUE_NAME, true, false, false, null);
            
            // Bind the queue to the exchange
            channel.queueBind(PAYMENT_QUEUE_NAME, EXCHANGE_NAME, PAYMENT_ROUTING_KEY);
            
            // Create a payment status message (JSON)
            ObjectMapper objectMapper = new ObjectMapper();
            String message = objectMapper.writeValueAsString(
                java.util.Map.of(
                    "orderId", order.getOrderId(),
                    "items" , order.getDishIds(),
                    "status", order.getOrderStatus(), 
                    "payment acception", order.getPayment().getPaymentStatus(),
                    "timestamp", System.currentTimeMillis()
                )
            );
            
            // Publish to the exchange with the payment routing key
            channel.basicPublish(EXCHANGE_NAME, PAYMENT_ROUTING_KEY, null, message.getBytes());
            System.out.println(" [x] Sent payment status update for order '" + order.getOrderId()+ "' to topic exchange");
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
                    "Customer Name:", order.getCustomerUsername(),
                    "timestamp", System.currentTimeMillis()
                )
            );
            
            // Publish to the exchange with the order status routing key
            channel.basicPublish(EXCHANGE_NAME, ORDER_STATUS_ROUTING_KEY, null, message.getBytes());
            System.out.println(" [x] Sent order status update for order '" + order.getOrderId()+ "' to topic exchange");
        }
    }
}
