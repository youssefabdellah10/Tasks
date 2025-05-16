package com.example.Repositories;

import java.util.List;

import com.example.Model.Notification;

import jakarta.ejb.Singleton;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Singleton
public class NotificationRepo {

    @PersistenceContext(unitName = "CustomerPU")
    private EntityManager entityManager;

    public NotificationRepo() {
    }
    public boolean saveNotification(Notification notification) {
        try {
            entityManager.persist(notification);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }    public List<Notification> getAllNotifications(String customerUsername) {
        return entityManager.createQuery("SELECT n FROM Notification n WHERE n.customer.username = :customerUsername", Notification.class)
                .setParameter("customerUsername", customerUsername)
                .getResultList();
    }
    
}
