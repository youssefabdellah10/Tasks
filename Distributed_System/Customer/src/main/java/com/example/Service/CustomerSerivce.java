package com.example.Service;
import com.example.Model.Customer;

import jakarta.ejb.Stateless;
import jakarta.persistence.*;
import java.util.List;

@Stateless
public class CustomerSerivce {
    @PersistenceContext(unitName = "CustomerPU")
    private EntityManager entityManager;
    
    public boolean saveCustomer(Customer customer) {
        try {
            String username = customer.getUsername();
            Customer existingCustomer = entityManager.find(Customer.class, username);
            if (existingCustomer != null) {
                return false; // User with the same username already exists
            }
            entityManager.persist(customer);
            return true; // User saved successfully
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public List<Customer> getAllCustomers() {
        try {
            return entityManager.createQuery("SELECT c FROM Customer c", Customer.class)
                    .getResultList();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
