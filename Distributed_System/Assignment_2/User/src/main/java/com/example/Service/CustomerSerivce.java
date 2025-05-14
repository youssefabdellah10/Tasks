package com.example.Service;
import com.example.Model.Customer;
import com.example.Repositories.CustomerRepo;

import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import java.util.List;

@Stateless
public class CustomerSerivce {
    @Inject
    private CustomerRepo customerRepo;
      public boolean saveCustomer(Customer customer) {
        try {
            return customerRepo.saveCustomer(customer);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public List<Customer> getAllCustomers() {
        try {
            return customerRepo.getAllCustomers();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    public Customer findCustomerByUsername(String username) {
        try {
            return customerRepo.findCustomerByUsername(username);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    public boolean updateCustomer(Customer customer) {
        try {
            return customerRepo.updateCustomer(customer);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public boolean deleteCustomer(String username) {
        try {
            return customerRepo.deleteCustomer(username);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
   
}
