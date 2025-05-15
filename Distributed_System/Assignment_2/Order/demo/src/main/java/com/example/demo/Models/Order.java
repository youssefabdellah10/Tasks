package com.example.demo.Models;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "orders") // Using "orders" as table name since "order" is a reserved SQL keyword
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String orderId;
    @ElementCollection
    @CollectionTable(name = "order_dish_ids", joinColumns = @JoinColumn(name = "order_id"))
    @Column(name = "dish_id")
    private List<String> dishIds;
    
    @Column(name = "customer_username", nullable = false)
    private String customerUsername;
    
    @Column(name = "total_price")
    private double totalPrice;
    
    @Column(name = "order_status")
    private String orderStatus;
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "payment_id")
    private Payment payment;  
    public Order() {
        dishIds = new java.util.ArrayList<>();
        totalPrice = 0.0;
        orderStatus = "Pending";
    }    
    private static final double MIN_CHARGE = 100.0;
    
    public String getOrderId() {
        return orderId;
    }    public List<String> getDishIds() {
        return dishIds;
    }
    public void addDish(String dishId) {
        this.dishIds.add(dishId);
    }public String getCustomerUsername() {
        return customerUsername;
    }
    public void setCustomerUsername(String customerUsername) {
        this.customerUsername = customerUsername;
    }    public double getTotalPrice() {
        return totalPrice;
    }
    public String getOrderStatus() {
        return orderStatus;
    }
    public void updateOrderStatus(String status) {
        this.orderStatus = status;
    }
    public void setpayment(Payment payment) {
        this.payment = payment;
    }
    public Payment getPayment() {
        return payment;
    }
    public static double getMinCharge() {
        return MIN_CHARGE;
    } 
    
}
