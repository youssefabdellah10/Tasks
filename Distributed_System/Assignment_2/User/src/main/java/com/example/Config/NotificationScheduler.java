package com.example.Config;

import com.example.Service.NotificationService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.annotation.Resource;
import jakarta.ejb.Schedule;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.ejb.Timeout;
import jakarta.ejb.Timer;
import jakarta.ejb.TimerConfig;
import jakarta.ejb.TimerService;
import jakarta.inject.Inject;

import java.util.logging.Level;
import java.util.logging.Logger;

@Singleton
@Startup
public class NotificationScheduler {
    
    private static final Logger LOGGER = Logger.getLogger(NotificationScheduler.class.getName());
    
    @Resource
    private TimerService timerService;
    
    @Inject
    private NotificationService notificationService;
    
   
    @PostConstruct
    public void init() {
        LOGGER.info("Initializing notification scheduler...");
        
        // Schedule the initial check after 10 seconds to allow the application to fully start
        TimerConfig config = new TimerConfig("InitialNotificationCheck", false);
        timerService.createSingleActionTimer(10000, config);
        
        LOGGER.info("Notification scheduler initialized successfully");
    }
    
    
    @Timeout
    public void initialCheck(Timer timer) {
        LOGGER.info("Starting initial notification check...");
        processAvailableNotifications();
    }
    
    
    @Schedule(hour = "*", minute = "*", second = "*/30", persistent = false)
    public void scheduledCheck() {
        LOGGER.info("Running scheduled notification check...");
        processAvailableNotifications();
    }
    
    
    private void processAvailableNotifications() {
        try {
            
            int processedCount = 0;
            for (int i = 0; i < 5; i++) {
                boolean processed = notificationService.generateNotification();
                if (!processed) {
                    
                    break;
                }
                processedCount++;
            }
            
            if (processedCount > 0) {
                LOGGER.info("Processed " + processedCount + " notification(s)");
            } else {
                LOGGER.fine("No notifications available for processing");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error processing notifications", e);
        }
    }
    
    
    @PreDestroy
    public void cleanup() {
        LOGGER.info("Notification scheduler shutting down...");
    }
}
