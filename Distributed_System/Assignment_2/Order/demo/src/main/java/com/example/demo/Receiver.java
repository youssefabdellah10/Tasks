package com.example.demo;

import java.nio.charset.StandardCharsets;

import org.springframework.stereotype.Service;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.DeliverCallback;

@Service
public class Receiver {
    private final static String QUEUE_NAME = "dishStock";

    public double receiveStoc() throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("localhost");
        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        // Declare the queue
        channel.queueDeclare(QUEUE_NAME, true, false, false, null);
        System.out.println("[*] Waiting for messages in " + QUEUE_NAME);
        final java.util.concurrent.CountDownLatch latch = new java.util.concurrent.CountDownLatch(1);
        final double[] totalprice = {-1.0}; // Default value
        DeliverCallback deliverCallback = (consumerTag, delivery) -> {
            String message = new String(delivery.getBody(), StandardCharsets.UTF_8);
            try {
                totalprice[0] = Double.parseDouble(message);
                System.out.println("Received total price from dish service: " + message);
                latch.countDown(); 
            } catch (NumberFormatException e) {
                System.err.println("Could not parse price from message: " + message);
            }
        };

        String consumerTag = channel.basicConsume(QUEUE_NAME, true, deliverCallback, tag -> {});
        
        // Wait for a message - but with a timeout
        boolean received = latch.await(10, java.util.concurrent.TimeUnit.SECONDS);
        
        channel.basicCancel(consumerTag);
        channel.close();
        connection.close();
        
        if (!received) {
            System.err.println("[!] Timed out waiting for price response from dish service");
            return -1.0; // Indicate failure
        }
        
        return totalprice[0];
    }
    
}
