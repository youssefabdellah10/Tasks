package com.example.demo.Controller;

import com.example.demo.Models.Order;
import com.example.demo.Models.OrderItem;
import com.example.demo.Services.OrderService;

import jakarta.ws.rs.QueryParam;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
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
     @PostMapping("/placeOrder")
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
            boolean isPaid = orderService.ispaid(token, orderId);
            if(isPaid){
               return ResponseEntity.ok("Order is paid successfully");
            } else {
                return ResponseEntity.status(400).body("faield to pay"); 
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing payment: " + e.getMessage());
        }
    }

    
}


