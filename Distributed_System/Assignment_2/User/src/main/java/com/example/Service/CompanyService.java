package com.example.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.HashSet;
import java.util.Set;

import com.example.Model.Company;

import jakarta.ejb.Singleton;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

@Singleton
public class CompanyService {
    
    @PersistenceContext(unitName = "CustomerPU")
    private EntityManager entityManager;
    
   
    public String generateCompanyUniqueName(String companyName) {
        if (companyName == null || companyName.isEmpty()) {
            throw new IllegalArgumentException("Company name cannot be empty");
        }
        
        String prefix = companyName.length() >= 3 ? 
                companyName.substring(0, 3).toUpperCase() : 
                companyName.toUpperCase();
        
        Random random = new Random();
        
        int randomNum = random.nextInt(1000);
        String suffix = String.format("%03d", randomNum);
        
        return prefix + suffix;
    }
    
   
    public List<String> generateCompanyUniqueNames(String companyName, int count) {
        if (companyName == null || companyName.isEmpty()) {
            throw new IllegalArgumentException("Company name cannot be empty");
        }
        
        List<String> uniqueNames = new ArrayList<>();
        Set<String> nameSet = new HashSet<>(); 
        
        while (nameSet.size() < count) {
            String uniqueName = generateCompanyUniqueName(companyName);
            
            if (nameSet.add(uniqueName)) {
                uniqueNames.add(uniqueName);
            }
        }
        
        return uniqueNames;
    }
    
  
    public boolean saveCompany(Company company) {
        try {
            String companyName = company.getCompanyName();
            Company existingCompany = entityManager.find(Company.class, companyName);
            
            if (existingCompany != null) {
                return false;
            }
            
            entityManager.persist(company);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    
    public Company createCompanyWithUniqueNames(String companyName, String companyAddress, int uniqueNameCount) {
        try {
            List<String> uniqueNames = generateCompanyUniqueNames(companyName, uniqueNameCount);
            Company company = new Company(companyName, companyAddress, uniqueNames);
            
            if (saveCompany(company)) {
                return company;
            } else {
                return null;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    
    public boolean hasCompanies() {
        try {
            TypedQuery<Long> query = entityManager.createQuery(
                "SELECT COUNT(c) FROM Company c", Long.class);
            Long count = query.getSingleResult();
            return count > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
     public List<Company> getAllCompanies() {
        try {
            TypedQuery<Company> query = entityManager.createQuery(
                "SELECT c FROM Company c", Company.class);
            return query.getResultList();
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    public Company getCompanyByName(String companyName) {
        try {
            return entityManager.find(Company.class, companyName);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
