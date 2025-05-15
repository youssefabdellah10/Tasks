package com.example.demo.Models;

import jakarta.persistence.*;

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String paymentId;
    
    private boolean paymentStatus;
      @Column(name = "customer_username", nullable = false)
    private String customerUsername;
    
    private String type;
    
    private double balance;
    public Payment(){
        this.paymentStatus = false;
        this.type="cash";
        this.balance=1000.0;
    }
    public void setpaymentstatus(boolean paymentStatus) {
        this.paymentStatus = paymentStatus;
    }    public void setCustomerUsername(String customerUsername) {
        this.customerUsername = customerUsername;
    }
    public void setType(String type) {
        this.type = type;
    }
    public void setBalance(double balance) {
        this.balance = balance;
    }
    public String getPaymentId() {
        return paymentId;
    }
    public boolean getPaymentStatus() {
        return paymentStatus;
    }    public String getCustomerUsername() {
        return customerUsername;
    }
    public String getType() {
        return type;
    }
    public double getBalance() {
        return balance;
    }

}
