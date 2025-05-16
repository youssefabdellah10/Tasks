

package com.example.demo.Models;

public class OrderItem {
    private Integer dishId;
    private Integer quantity;
    
    public OrderItem() {}
    
    public Integer getDishId() {
        return dishId;
    }
    
    public void setDishId(Integer dishId) {
        this.dishId = dishId;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}