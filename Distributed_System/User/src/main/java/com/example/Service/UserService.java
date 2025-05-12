package com.example.Service;

import com.example.Model.Admin;
import com.example.Model.Customer;
import com.example.Model.Seller;

import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Stateless
public class UserService {
    @PersistenceContext(unitName = "CustomerPU")
    private EntityManager entityManager;
     public boolean login(String username, String password) {
        try {
            Customer customer = entityManager.find(Customer.class, username);
            Admin admin = entityManager.find(Admin.class, username);
            Seller seller = entityManager.find(Seller.class, username);
            if (customer != null && customer.getPassword().equals(password)) {
                return true; 
            }
            else if (admin != null && admin.getPassword().equals(password)) {
                return true; 
            }
            else if (seller != null && seller.getPassword().equals(password)) {
                return true; 
            }
            return false;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    
}
