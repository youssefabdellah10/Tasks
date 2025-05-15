package com.example.demo.Controller;

import com.example.demo.Services.OrderService;
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
    }    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders(@RequestHeader("Authorization") String token) {
        try {
            return ResponseEntity.ok(orderService.getAllOrders(token));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving all orders: " + e.getMessage());
        }
    }
      @PostMapping("/placeOrder")
    public ResponseEntity<?> createOrder(@RequestBody List<Integer> dishIds, 
                                        @RequestHeader("Authorization") String token) {
        try {
            orderService.createdOrder(dishIds, token);
            return ResponseEntity.ok("Order created successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error placing order: " + e.getMessage());
        }
    }
}


