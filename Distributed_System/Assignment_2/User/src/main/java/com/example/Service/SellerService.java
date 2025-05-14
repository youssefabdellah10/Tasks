package com.example.Service;

import com.example.Model.Company;
import com.example.Model.Seller;
import com.example.Repositories.SellerRepo;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import java.util.Random;

@Stateless
public class SellerService {
    @Inject
    private SellerRepo sellerRepo;
    
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
      public Seller generateSellerAccount(String CompanyName, String seller_name) {
        try {
            // Get the company via the CompanyService instead of direct entity manager access
            Company company = companyService.getCompanyByName(CompanyName);
            
            if(CompanyName == null || CompanyName.isEmpty() || company == null) {
                throw new IllegalArgumentException("Company name cannot be empty or company does not exist");
            }
            
            Seller newSeller = new Seller();
            
            // Generate a unique username
            while (true) {
                String username = companyService.generateCompanyUniqueName(CompanyName);
                // Use sellerRepo to check if username exists
                if (!sellerRepo.usernameExists(username)) {
                    newSeller.setUsername(username);
                    break;
                }
            }
            
            newSeller.setCompany(company);
            newSeller.setSeller_name(seller_name);
            newSeller.setPassword(generateRandomPassword(6));
            
            company.getSellers().add(newSeller);
            
            // Use SellerRepo to persist
            sellerRepo.persistSeller(newSeller);
            
            return newSeller; 
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
}
