package com.example.Repositories;

import com.example.Model.Customer;
import jakarta.ejb.Singleton;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;

@Singleton
public class CustomerRepo {
    @PersistenceContext(unitName = "CustomerPU")
    private EntityManager entityManager;
    
    public CustomerRepo() {
    }
    
    public Customer findCustomerByUsername(String username) {
        try {
            return entityManager.createQuery("SELECT c FROM Customer c WHERE c.username = :username", Customer.class)
                    .setParameter("username", username)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }
    
    public List<Customer> getAllCustomers() {
        return entityManager.createQuery("SELECT c FROM Customer c", Customer.class)
                .getResultList();
    }
    
    public boolean saveCustomer(Customer customer) {
        try {
            String username = customer.getUsername();
            Customer existingCustomer = findCustomerByUsername(username);
            
            if (existingCustomer != null) {
                return false; // Customer with same username already exists
            }
            
            entityManager.persist(customer);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public boolean updateCustomer(Customer customer) {
        try {
            entityManager.merge(customer);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public boolean deleteCustomer(String username) {
        try {
            Customer customer = findCustomerByUsername(username);
            if (customer != null) {
                entityManager.remove(customer);
                return true;
            }
            return false;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public boolean usernameExists(String username) {
        try {
            TypedQuery<Long> query = entityManager.createQuery(
                "SELECT COUNT(c) FROM Customer c WHERE c.username = :username", Long.class);
            query.setParameter("username", username);
            return query.getSingleResult() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
