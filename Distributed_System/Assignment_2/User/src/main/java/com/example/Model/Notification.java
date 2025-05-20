package com.example.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "CustomerUsername", referencedColumnName = "username", nullable = false)
    private Customer customer;
    
    @Column(name = "order_id", nullable = false)
    private String orderId;
      @Column(name = "order_status", nullable = false)
    private String status;
    
    @Column(name = "reason")
    private String reason;
    
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    public Notification() {
        this.timestamp = LocalDateTime.now(); 
    }
    
    public Notification(Customer customer, String orderId, String status) {
        this.customer = customer;
        this.orderId = orderId;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }
    
    public Notification(Customer customer, String orderId, String status, String reason) {
        this.customer = customer;
        this.orderId = orderId;
        this.status = status;
        this.reason = reason;
        this.timestamp = LocalDateTime.now();
    }
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getStatus() {
        return status;
    }    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

}
