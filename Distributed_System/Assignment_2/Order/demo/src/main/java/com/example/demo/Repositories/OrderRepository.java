package com.example.demo.Repositories;

import com.example.demo.Models.Order;

import jakarta.inject.Singleton;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Singleton
public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByCustomerUsername(String customerUsername);
    Order findByOrderId(String orderId);
    @Override
    List<Order> findAll();
}
