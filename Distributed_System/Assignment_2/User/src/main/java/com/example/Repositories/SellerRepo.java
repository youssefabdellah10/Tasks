package com.example.Repositories;

import com.example.Model.Company;
import com.example.Model.Seller;

import jakarta.ejb.Singleton;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.util.List;

@Singleton
public class SellerRepo {
    @PersistenceContext(unitName = "CustomerPU")
    private EntityManager entityManager;
    
    public SellerRepo() {
    }

    public void persistSeller(Seller seller) {
        entityManager.persist(seller);
    }
    
    public Seller findSellerByUsername(String username) {
        try {
            return entityManager.createQuery("SELECT s FROM Seller s WHERE s.username = :username", Seller.class)
                    .setParameter("username", username)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }
    
    public List<Seller> getAllSellers() {
        return entityManager.createQuery("SELECT s FROM Seller s", Seller.class)
                .getResultList();
    }
    
    public List<Seller> getSellersByCompany(Company company) {
        return entityManager.createQuery("SELECT s FROM Seller s WHERE s.company = :company", Seller.class)
                .setParameter("company", company)
                .getResultList();
    }
    
    public boolean usernameExists(String username) {
        try {
            TypedQuery<Long> query = entityManager.createQuery(
                "SELECT COUNT(s) FROM Seller s WHERE s.username = :username", Long.class);
            query.setParameter("username", username);
            return query.getSingleResult() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
