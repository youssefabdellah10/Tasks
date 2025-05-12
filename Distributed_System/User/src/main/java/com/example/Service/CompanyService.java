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
    
    /**
     * Generates a single unique name for a company
     * Format: First 3 letters of company name + 3 random digits
     * 
     * @param companyName The name of the company
     * @return A unique name string
     */
    public String generateCompanyUniqueName(String companyName) {
        if (companyName == null || companyName.isEmpty()) {
            throw new IllegalArgumentException("Company name cannot be empty");
        }
        
        // Get first 3 characters of company name, or fewer if name is shorter
        String prefix = companyName.length() >= 3 ? 
                companyName.substring(0, 3).toUpperCase() : 
                companyName.toUpperCase();
        
        Random random = new Random();
        
        // Generate 3 random digits
        int randomNum = random.nextInt(1000);
        // Format to ensure 3 digits with leading zeros if needed
        String suffix = String.format("%03d", randomNum);
        
        return prefix + suffix;
    }
    
    /**
     * Generates a list of unique names for a company
     * Format: First 3 letters of company name + 3 random digits
     * 
     * @param companyName The name of the company
     * @param count The number of unique names to generate
     * @return List of unique names
     */
    public List<String> generateCompanyUniqueNames(String companyName, int count) {
        if (companyName == null || companyName.isEmpty()) {
            throw new IllegalArgumentException("Company name cannot be empty");
        }
        
        List<String> uniqueNames = new ArrayList<>();
        Set<String> nameSet = new HashSet<>(); // To ensure uniqueness
        
        while (nameSet.size() < count) {
            String uniqueName = generateCompanyUniqueName(companyName);
            
            // Only add if this exact name hasn't been generated yet
            if (nameSet.add(uniqueName)) {
                uniqueNames.add(uniqueName);
            }
        }
        
        return uniqueNames;
    }
    
    /**
     * Saves a company to the database
     * 
     * @param company The company to save
     * @return true if successful, false otherwise
     */
    public boolean saveCompany(Company company) {
        try {
            String companyName = company.getCompanyName();
            Company existingCompany = entityManager.find(Company.class, companyName);
            
            if (existingCompany != null) {
                return false; // Company with the same name already exists
            }
            
            entityManager.persist(company);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Creates a company with generated unique names
     * 
     * @param companyName The name of the company
     * @param companyAddress The address of the company
     * @param uniqueNameCount The number of unique names to generate
     * @return The created company or null if creation failed
     */
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
    
    /**
     * Checks if any companies exist in the database
     * 
     * @return true if at least one company exists, false otherwise
     */
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
    
    /**
     * Gets all companies from the database
     * 
     * @return List of all companies
     */
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
}
