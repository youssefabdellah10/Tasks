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
    }    

    public boolean generateNotification() {
        try {
            Notification notification = receiver.startOrderStatusConsumer();
            if (notification != null) {
                return notificationRepo.saveNotification(notification);
            }
            return false;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Notification> getAllNotifications(String customerUsername) {
        return notificationRepo.getAllNotifications(customerUsername);
    }
}
