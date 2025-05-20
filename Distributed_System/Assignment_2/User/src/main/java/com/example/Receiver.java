package com.example;

import com.example.Model.Customer;
import com.example.Model.Notification;
import com.example.Repositories.CustomerRepo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.*;

import jakarta.ejb.EJB;
import jakarta.ejb.Stateless;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;
import java.util.concurrent.TimeoutException;

@Stateless
public class Receiver {    private static final String EXCHANGE_NAME = "order_exchange";
    private static final String ORDER_NOTIFICATION_QUEUE_NAME = "notification";
    private static final String ORDER_NOTIFICATION_ROUTING_KEY = "orders.noti";
    
    @EJB
    private CustomerRepo customerRepo;

    public Notification startOrderStatusConsumer() {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        
        try {
            Connection connection = factory.newConnection();
            Channel channel = connection.createChannel();
            
            // Declare the topic exchange
            channel.exchangeDeclare(EXCHANGE_NAME, "topic", true);
              // Declare the order notification queue
            channel.queueDeclare(ORDER_NOTIFICATION_QUEUE_NAME, true, false, false, null);
            
            // Bind the queue to the exchange
            channel.queueBind(ORDER_NOTIFICATION_QUEUE_NAME, EXCHANGE_NAME, ORDER_NOTIFICATION_ROUTING_KEY);
            
            System.out.println(" [*] Waiting for a single order status message...");
              // Get a single message without auto-ack
            GetResponse response = channel.basicGet(ORDER_NOTIFICATION_QUEUE_NAME, false);
            
            if (response == null) {
                System.out.println("No message available.");
                return null;
            }
            
            String message = new String(response.getBody(), "UTF-8");
            System.out.println(" [x] Received order status update: '" + message + "'");
            
            try {
                // Parse the message into a notification
                Notification notification = parseMessageToNotification(message);
                
                // Acknowledge the message
                channel.basicAck(response.getEnvelope().getDeliveryTag(), false);
                
                // Close the connection
                channel.close();
                connection.close();
                
                return notification;
            } catch (Exception e) {
                System.err.println("Error processing order status message: " + e.getMessage());
                e.printStackTrace();
                
                // Reject the message
                channel.basicReject(response.getEnvelope().getDeliveryTag(), false);
                
                // Close the connection
                channel.close();
                connection.close();
                
                throw new RuntimeException("Failed to process notification", e);
            }
        } catch (IOException | TimeoutException e) {
            System.err.println("Error starting order status consumer: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to connect to message queue", e);
        }
    }    public Notification parseMessageToNotification(String jsonMessage) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> orderData = objectMapper.readValue(jsonMessage, 
                objectMapper.getTypeFactory().constructMapType(Map.class, String.class, Object.class));

        String orderId = (String) orderData.get("orderId");
        String status = (String) orderData.get("status");
        String customerUsername = (String) orderData.get("Customer Name:");
        Long timestamp = (Long) orderData.get("timestamp");
        String reason = (String) orderData.get("reason"); // Extract the reason field
  
        Customer customer = customerRepo.findCustomerByUsername(customerUsername);
        
        if (customer == null) {
            throw new IllegalStateException("Customer not found: " + customerUsername);
        }
        
        Notification notification;
        if (reason != null && !reason.isEmpty()) {
            notification = new Notification(customer, orderId, status, reason);
            System.out.println("Processing notification with reason: " + reason);
        } else {
            notification = new Notification(customer, orderId, status);
        }
        
        if (timestamp != null) {
            LocalDateTime messageTime = LocalDateTime.ofInstant(
                Instant.ofEpochMilli(timestamp), 
                ZoneId.systemDefault()
            );
            notification.setTimestamp(messageTime);
        }
        
        return notification;
    }
}
