package com.example.demo.Controller;

import com.example.demo.Models.Order;
import com.example.demo.Models.OrderItem;
import com.example.demo.Services.OrderService;

import jakarta.ws.rs.QueryParam;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:3000"}, allowedHeaders = "*", allowCredentials = "false")
public class OrderController {

    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }
   
    @GetMapping("/myorders")
    public ResponseEntity<?> getOrders(@RequestHeader("Authorization") String token) {
        try {
            return ResponseEntity.ok(orderService.getAllOrdersOfCustomer(token));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving orders: " + e.getMessage());
        }
    } 
    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders(@RequestHeader("Authorization") String token) {
        try {
            return ResponseEntity.ok(orderService.getAllOrders(token));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving all orders: " + e.getMessage());
        }    
    } 
     @PostMapping("/placeorder")
    public ResponseEntity<?> createOrder(@RequestBody List<OrderItem> orderItems, 
                                        @RequestHeader("Authorization") String token) {
        try {
            Order order = orderService.createdOrder(orderItems, token);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error placing order: " + e.getMessage());
        }
    }
    @PostMapping("/payOrder")
    public ResponseEntity<?> payOrder(@QueryParam("orderId") String orderId, 
                                        @RequestHeader("Authorization") String token) {
        try {
            boolean ismetMinCharge = orderService.ismetMinCharge(orderId);
            if(!ismetMinCharge){
                return ResponseEntity.status(400).body("Order is not met minimum charge");
            }
            boolean isPaid = orderService.ispaid(token, orderId);
            if(isPaid){
               return ResponseEntity.ok("Order is paid successfully");
            } else {
                return ResponseEntity.status(400).body("faield to pay , please charge your balance and try again!"); 
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing payment: " + e.getMessage());
        }
    }    @GetMapping("/mybalance")
    public ResponseEntity<?> getBalance(@RequestHeader("Authorization") String token) {
        try {
            double balance = orderService.getBalance(token);
            return ResponseEntity.ok(balance);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving balance: " + e.getMessage());
        }
    }
}


