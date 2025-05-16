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
        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {

            // Declare the queue
            channel.queueDeclare(QUEUE_NAME, true, false, false, null);
            System.out.println(" Waiting for messages in " + QUEUE_NAME);
            final double[] totalprice = new double[1];
            DeliverCallback deliverCallback = (consumerTag, delivery) -> {
                String message = new String(delivery.getBody(), StandardCharsets.UTF_8);
                totalprice[0] = Double.parseDouble(message);
                System.out.println(" Received  total price from dish service with price needed" + message + "'");
            };

            channel.basicConsume(QUEUE_NAME, true, deliverCallback, consumerTag -> { });
            return totalprice[0];
        }
    }
    
}
