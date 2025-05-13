package com.example.Service;

import com.example.Model.Company;
import com.example.Model.Seller;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.Random;

@Stateless
public class SellerService {
    @PersistenceContext(unitName = "CustomerPU")
    private EntityManager entityManager;
    @Inject
    private CompanyService companyService;
    
    public String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder password = new StringBuilder();
        Random random = new Random();
        
        for (int i = 0; i < length; i++) {
            int index = random.nextInt(chars.length());
            password.append(chars.charAt(index));
        }
        
        return password.toString();
    }
    
    public Seller generateSellerAccount(String CompanyName,String seller_name) {
        Company company = entityManager.find(Company.class, CompanyName);
        try {
            if(CompanyName == null || CompanyName.isEmpty() || company == null) {
                throw new IllegalArgumentException("Company name cannot be empty");
            }
            Seller newSeller = new Seller();
            String username = null;
            while (true) {
                username= companyService.generateCompanyUniqueName(CompanyName);;
                Seller existingSeller = entityManager.find(Seller.class,username);
                if (existingSeller == null) {
                    newSeller.setUsername(username);
                    break;
                }
            }
             newSeller.setCompany(company);
            newSeller.setSeller_name(seller_name);
            newSeller.setPassword(generateRandomPassword(6));
            entityManager.persist(newSeller);
            return newSeller; 
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
}
