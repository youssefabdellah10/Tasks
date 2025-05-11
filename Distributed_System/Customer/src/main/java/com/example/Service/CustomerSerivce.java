package com.example.Service;
import com.example.Model.Customer;

import jakarta.ejb.Stateless;
import jakarta.persistence.*;
@Stateless
public class CustomerSerivce {
    @PersistenceUnit(unitName = "CustomerPU")
    private EntityManagerFactory entityManagerFactory;
      public boolean saveCustomer(Customer customer) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        EntityTransaction transaction = entityManager.getTransaction();
        
        try {
            transaction.begin();
            
            String username = customer.getUsername();
            Customer existingCustomer = entityManager.find(Customer.class, username);
            if (existingCustomer != null) {
                return false; // User with the same username already exists
            }
            entityManager.persist(customer);
            
            transaction.commit();
            return true; // User saved successfully
        } catch (Exception e) {
            if (transaction != null && transaction.isActive()) {
                transaction.rollback();
            }
            e.printStackTrace();
            return false;
        } finally {
            entityManager.close();
        }
    }

}
 