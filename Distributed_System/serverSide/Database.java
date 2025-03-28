package serverSide;

import java.util.*;
import java.util.concurrent.*;
import model.*;

public class Database {
    
    private static Database instance;
    
    private final ConcurrentHashMap<String, Customer> customers;
    private final ConcurrentHashMap<String, Driver> drivers;
    private final ConcurrentHashMap<String, Admin> admins;
    private final ConcurrentHashMap<String, ClientHandler> customerHandlers;
    private final ConcurrentHashMap<String, ClientHandler> driverHandlers;
    private final ConcurrentHashMap<String, String> customerDriverPairs;
    private final ConcurrentHashMap<String, String> driverPendingOffers;
    private final ConcurrentHashMap<String, RideStatus> rideStatus;
    
    private final Object pairingLock = new Object();
    private final Object offerLock = new Object();
    private final Object rideLock = new Object();
    
    private Database() {
        customers = new ConcurrentHashMap<>();
        drivers = new ConcurrentHashMap<>();
        admins = new ConcurrentHashMap<>();
        customerHandlers = new ConcurrentHashMap<>();
        driverHandlers = new ConcurrentHashMap<>();
        customerDriverPairs = new ConcurrentHashMap<>();
        driverPendingOffers = new ConcurrentHashMap<>();
        rideStatus = new ConcurrentHashMap<>();
        
        admins.put("admin", new Admin("admin", "123"));
    }
    
    public static synchronized Database getInstance() {
        if (instance == null) {
            instance = new Database();
        }
        return instance;
    }
    
    public Customer getCustomer(String username) {
        return customers.get(username);
    }
    
    public void addCustomer(String username, String password) {
        if (!customers.containsKey(username)) {
            customers.put(username, new Customer(username, password));
        } else {
            Customer customer = customers.get(username);
            if (customer.getPassword() == null || customer.getPassword().isEmpty()) {
                customer.setPassword(password);
            }
        }
    }
    
    public Map<String, Customer> getAllCustomers() {
        return customers;
    }
    
    public Driver getDriver(String username) {
        return drivers.get(username);
    }
    
    public void addDriver(String username, String password) {
        if (!drivers.containsKey(username)) {
            drivers.put(username, new Driver(username, password));
        } else {
            Driver driver = drivers.get(username);
            if (driver.getPassword() == null || driver.getPassword().isEmpty()) {
                driver.setPassword(password);
            }
        }
    }
    
    public Map<String, Driver> getAllDrivers() {
        return drivers;
    }
    
    public Admin getAdmin(String username) {
        return admins.get(username);
    }
    
    public boolean authenticateAdmin(String username, String password) {
        Admin admin = admins.get(username);
        return admin != null && admin.getPassword().equals(password);
    }
    
    public void registerClientHandler(String username, String userType, ClientHandler handler) {
        if (userType.equals("CUSTOMER")) {
            customerHandlers.put(username, handler);
            customers.computeIfAbsent(username, k -> new Customer(username, ""));
        } else if (userType.equals("DRIVER")) {
            driverHandlers.put(username, handler);
            drivers.computeIfAbsent(username, k -> new Driver(username, ""));
        }
    }
    
    public void unregisterClientHandler(String username, String userType) {
        if (userType.equals("CUSTOMER")) {
            customerHandlers.remove(username);
        } else if (userType.equals("DRIVER")) {
            driverHandlers.remove(username);
        }
    }
    
    public ClientHandler getCustomerHandler(String username) {
        return customerHandlers.get(username);
    }
    
    public ClientHandler getDriverHandler(String username) {
        return driverHandlers.get(username);
    }
    
    public Map<String, ClientHandler> getAllCustomerHandlers() {
        return customerHandlers;
    }
    
    public Map<String, ClientHandler> getAllDriverHandlers() {
        return driverHandlers;
    }
    
    public void pairCustomerDriver(String customerUsername, String driverUsername) {
        synchronized (pairingLock) {
            customerDriverPairs.put(customerUsername, driverUsername);
        }
    }
    
    public String getDriverForCustomer(String customerUsername) {
        return customerDriverPairs.get(customerUsername);
    }
    
    public String getCustomerForDriver(String driverUsername) {
        for (Map.Entry<String, String> entry : customerDriverPairs.entrySet()) {
            if (entry.getValue().equals(driverUsername)) {
                return entry.getKey();
            }
        }
        return null;
    }
    
    public void unpairCustomerDriver(String customerUsername) {
        synchronized (pairingLock) {
            customerDriverPairs.remove(customerUsername);
        }
    }
    
    public boolean isPairedWithCustomer(String driverUsername, String customerUsername) {
        String pairedDriver = customerDriverPairs.get(customerUsername);
        return pairedDriver != null && pairedDriver.equals(driverUsername);
    }
    
    public boolean isPairedDriver(String driverName) {
        return customerDriverPairs.containsValue(driverName);
    }

    public void addDriverPendingOffer(String driverUsername, String customerUsername) {
        synchronized (offerLock) {
            driverPendingOffers.put(driverUsername, customerUsername);
        }
    }
    
    public String getPendingOfferCustomer(String driverUsername) {
        return driverPendingOffers.get(driverUsername);
    }
    
    public void removeDriverPendingOffer(String driverUsername) {
        synchronized (offerLock) {
            driverPendingOffers.remove(driverUsername);
        }
    }
    
    public boolean hasDriverPendingOffer(String driverUsername) {
        return driverPendingOffers.containsKey(driverUsername);
    }
    
    public void setRideStatus(String driverUsername, RideStatus status) {
        rideStatus.put(driverUsername, status);
    }
    
    public RideStatus getRideStatus(String driverUsername) {
        return rideStatus.get(driverUsername);
    }
    
    public void removeRideStatus(String driverUsername) {
        rideStatus.remove(driverUsername);
    }
    public void cleanRide(String customerUsername, String driverUsername) {
        synchronized (rideLock) {
            customerDriverPairs.remove(customerUsername);
            driverPendingOffers.remove(driverUsername);
            rideStatus.remove(driverUsername);
            
            Driver driver = getDriver(driverUsername);
            if (driver != null) {
                driver.setAvaialable(true);
            }
            
            Customer customer = getCustomer(customerUsername);
            if (customer != null) {
                customer.setHasAvtiveRide(false);
            }
        }
    }
}