package com.example.demo.Repositories;

import com.example.demo.Models.Payment;

import jakarta.inject.Singleton;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
@Singleton
public interface PaymentRepository extends JpaRepository<Payment, String> {
    Payment findPaymentByCustomerUsername(String customerUsername);
}
