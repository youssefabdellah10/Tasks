package com.example.Service;

import com.example.Receiver;
import com.example.Model.Notification;
import com.example.Repositories.NotificationRepo;

import java.util.List;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

@Stateless
public class NotificationService {   
    @Inject
    private NotificationRepo notificationRepo;
    
    @Inject
    private Receiver receiver;

    public NotificationService() {
    }
    
    public NotificationService(NotificationRepo notificationRepo, Receiver receiver) {
        this.receiver = receiver;
        this.notificationRepo = notificationRepo;
    }        public boolean generateNotification() {
        try {
            System.out.println("Attempting to receive notification from message queue...");
            Notification notification = receiver.startOrderStatusConsumer();
            
            if (notification != null) {
                System.out.println("Notification received successfully: Order ID=" + notification.getOrderId() + ", Status=" + notification.getStatus());
                boolean saved = notificationRepo.saveNotification(notification);
                if (saved) {
                    System.out.println("Notification saved successfully to database");
                } else {
                    System.err.println("Failed to save notification to database");
                }
                return saved;
            } else {
                System.out.println("No notification available in the queue");
                return false;
            }
        } catch (Exception e) {
            System.err.println("Error in generateNotification: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public List<Notification> getAllNotifications(String customerUsername) {
        return notificationRepo.getAllNotifications(customerUsername);
    }
}
