package com.example.Model;

import java.util.List;

import jakarta.persistence.*;
@Entity
public class Company {

    @Id
    private String companyName;
    @Column(name = "Address", nullable = false)
    private String companyAddress;
    
    @ElementCollection
    @CollectionTable(name = "company_unique_names", joinColumns = @JoinColumn(name = "company_name"))
    @Column(name = "unique_name")
    private List<String> companyUniqueNames;
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL)
    private List<Seller> sellers;
    
    public String getCompanyName() {
        return companyName;
    }
    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }
    public String getCompanyAddress() {
        return companyAddress;
    }
    public void setCompanyAddress(String companyAddress) {
        this.companyAddress = companyAddress;
    }
    public List<String> getCompanyUniqueNames() {
        return companyUniqueNames;
    }
    public void setCompanyUniqueNames(List<String> companyUniqueNames) {
        this.companyUniqueNames = companyUniqueNames;
    }
    public Company(String companyName, String companyAddress, List<String> companyUniqueNames) {
        this.companyName = companyName;
        this.companyAddress = companyAddress;
        this.companyUniqueNames = companyUniqueNames;
    }
    public List<Seller> getSellers() {
        return sellers;
    }
    public void addSeller(Seller seller) {
        this.sellers.add(seller);
    }
    public Company() {
    }

}
