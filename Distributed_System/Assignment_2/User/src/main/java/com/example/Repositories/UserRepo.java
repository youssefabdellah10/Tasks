package com.example.Repositories;

import com.example.Model.Admin;
import com.example.Model.Customer;
import com.example.Model.Seller;
import jakarta.ejb.Singleton;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;

@Singleton
public class UserRepo {
    @PersistenceContext(unitName = "CustomerPU")
    private EntityManager entityManager;

    public Customer findCustomerbyusername(String username) {
        try {
            return entityManager.createQuery("SELECT c FROM Customer c WHERE c.username = :username", Customer.class)
                    .setParameter("username", username)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }

    public Admin findAdminbyusername(String username) {
        try {
            return entityManager.createQuery("SELECT a FROM Admin a WHERE a.username = :username", Admin.class)
                    .setParameter("username", username)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }

    public Seller findSellerbyusername(String username) {
        try {
            return entityManager.createQuery("SELECT s FROM Seller s WHERE s.username = :username", Seller.class)
                    .setParameter("username", username)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }
}