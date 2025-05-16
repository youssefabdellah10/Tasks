package com.example.demo.Services;

import com.example.demo.Models.Order;
import com.example.demo.Models.Payment;
import com.example.demo.Repositories.OrderRepository;
import com.example.demo.Repositories.PaymentRepository;
import com.example.demo.Sender;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


import java.util.List;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Service
public class OrderService {    
    private final OrderRepository orderRepository; 
    private final PaymentRepository paymentRepository;
    private final Sender sender;
   
    @Value("${jwt.secret}")
    private String secretKey;

    @Autowired
    public OrderService(OrderRepository orderRepository,
                    PaymentRepository paymentRepository,
                    Sender sender) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.sender = sender;
    }
   
  
    private Claims extractAllClaims(String token) {
        if (token == null || token.isEmpty()) {
            throw new IllegalArgumentException("Token cannot be null or empty");
        }
        
        // Clean up token format by ensuring proper Bearer format
        token = token.trim();
        if (token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }
        
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (io.jsonwebtoken.security.SignatureException e) {
            throw new RuntimeException("Invalid JWT signature: " + e.getMessage());
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            throw new RuntimeException("JWT token has expired: " + e.getMessage());
        } catch (io.jsonwebtoken.MalformedJwtException e) {
            throw new RuntimeException("Malformed JWT token: " + e.getMessage());
        } catch (io.jsonwebtoken.UnsupportedJwtException e) {
            throw new RuntimeException("Unsupported JWT token: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Invalid JWT token: " + e.getMessage());
        }
    }
    
   
    public String extractUsernameFromToken(String token) {
        Claims claims = extractAllClaims(token);
        
        String subject = claims.getSubject();
        if (subject == null || subject.isEmpty()) {
            throw new RuntimeException("JWT subject is missing or empty");
        }
        return subject;
    }
    
    
    public String extractRoleFromToken(String token) {
        Claims claims = extractAllClaims(token);
        
        String role = claims.get("role", String.class);
        if (role != null) {
            return role;
        }
        
        // Try alternative claim names
        Object roles = claims.get("roles");
        if (roles != null) {
            if (roles instanceof String) {
                return (String) roles;
            } else if (roles instanceof List && !((List<?>) roles).isEmpty()) {
                return ((List<?>) roles).get(0).toString();
            }
        }
        
        Object authorities = claims.get("authorities");
        if (authorities != null) {
            return authorities.toString();
        }
        
        return null;
    }
    
    public List<Order> getAllOrdersOfCustomer(String token) {
        String role = extractRoleFromToken(token);
        if(role == null || !role.equals("CUSTOMER")) {
            throw new RuntimeException("Unauthorized access: Invalid role");
        }
        String username = extractUsernameFromToken(token);
        return orderRepository.findByCustomerUsername(username);
    }
    

    public List<Order> getAllOrders(String token) {
        String role = extractRoleFromToken(token);
        if(role == null || !role.equals("ADMIN")) {
            throw new RuntimeException("Unauthorized access: Admin role required");
        }
        return orderRepository.findAll();
    }   
    public void createdOrder(List<Integer> dishIds, String token) {
        String role = extractRoleFromToken(token);
        if(role == null || !role.equals("CUSTOMER")) {
            throw new RuntimeException("Unauthorized access: Invalid role");
        }
        String username = extractUsernameFromToken(token);
        Order order = new Order();
        order.setCustomerUsername(username);
        for(int dishId : dishIds) {
            order.addDish(dishId);
        }
        if(paymentRepository.findPaymentByCustomerUsername(username) == null) {
            Payment payment = new Payment();
            payment.setCustomerUsername(username);
            paymentRepository.save(payment);
        }
        
        Order savedOrder = orderRepository.save(order);
        
        try {
            sender.sendOrder(savedOrder);
        } catch (Exception e) {
            System.err.println("Failed to send order to message queue: " + e.getMessage());
            e.printStackTrace();
        }
    }

}
