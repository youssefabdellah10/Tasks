package com.example.Service;

import com.example.Model.Admin;
import com.example.Model.Customer;
import com.example.Model.Seller;

import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.HashMap;
import java.util.Map;

@Stateless
public class UserService {
    @PersistenceContext(unitName = "CustomerPU")
    private EntityManager entityManager;
    
    public static final String ROLE_CUSTOMER = "CUSTOMER";
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_SELLER = "SELLER";

    public Map<String, String> authenticate(String username, String password) {
        try {
            Customer customer = entityManager.find(Customer.class, username);
            Admin admin = entityManager.find(Admin.class, username);
            Seller seller = entityManager.find(Seller.class, username);
            
            Map<String, String> result = new HashMap<>();
            
            if (customer != null && customer.getPassword().equals(password)) {
                result.put("authenticated", "true");
                result.put("role", ROLE_CUSTOMER);
                result.put("name", customer.getCustomer_name());
                return result;
            }
            else if (admin != null && admin.getPassword().equals(password)) {
                result.put("authenticated", "true");
                result.put("role", ROLE_ADMIN);
                result.put("name", admin.getAdmin_name());
                return result;
            }
            else if (seller != null && seller.getPassword().equals(password)) {
                result.put("authenticated", "true");
                result.put("role", ROLE_SELLER);
                result.put("name", seller.getSeller_name());
                result.put("company", seller.getCompany().getCompanyName());
                return result;
            }
            
            result.put("authenticated", "false");
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> result = new HashMap<>();
            result.put("authenticated", "false");
            result.put("error", e.getMessage());            
            return result;
        }
    }
    
    public Map<String, String> getUserInfo(String username) {
        try {
            Customer customer = entityManager.find(Customer.class, username);
            Admin admin = entityManager.find(Admin.class, username);
            Seller seller = entityManager.find(Seller.class, username);
            
            Map<String, String> result = new HashMap<>();
            
            if (customer != null) {
                result.put("role", ROLE_CUSTOMER);
                result.put("name", customer.getCustomer_name());
                return result;
            }
            else if (admin != null) {
                result.put("role", ROLE_ADMIN);
                result.put("name", admin.getAdmin_name());
                return result;
            }
            else if (seller != null) {
                result.put("role", ROLE_SELLER);
                result.put("name", seller.getSeller_name());
                if (seller.getCompany() != null) {
                    result.put("company", seller.getCompany().getCompanyName());
                }
                return result;
            }
            
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
