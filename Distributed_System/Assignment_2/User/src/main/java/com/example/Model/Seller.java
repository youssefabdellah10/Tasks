package com.example.Model;
import jakarta.persistence.*;
@Entity
public class Seller {

    @Id
    private String username;
    @ManyToOne
    @JoinColumn(name = "company_name", referencedColumnName = "companyName")
    private Company company;
    @Column(name = "password",nullable = false)
    private String password;
    @Column(name = "name",nullable = false)
    private String seller_name;
    public String getUsername() {
        return username;
    }   
    public void setUsername(String username) {
        this.username = username;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getSeller_name() {
        return seller_name;
    }
    public void setSeller_name(String seller_name) {
        this.seller_name = seller_name;
    }
    public Company getCompany() {
        return company;
    }
    public void setCompany(Company company) {
        this.company = company;
    }
}
