package Uber;
import java.util.HashMap;
import java.util.Map;

import model.*;
import serverSide.ClientHandler;

public class PlainUberService implements UberService {

    private static PlainUberService instance;
    
    private Map<String, Customer> customers = new HashMap<>();
    private Map<String, Driver> drivers = new HashMap<>();
    
    private Map<String, ClientHandler> customerHandlers = new HashMap<>();
    private Map<String, ClientHandler> driverHandlers = new HashMap<>();
    private Map<String, String> customerDriverPairs = new HashMap<>();
    
    private PlainUberService() {
    }
    
    public static PlainUberService getInstance() {
        if (instance == null) {
            instance = new PlainUberService();
        }
        return instance;
    }
    
    public void registerClientHandler(String username, String userType, ClientHandler handler) {
        if (userType.equals("CUSTOMER")) {
            customerHandlers.put(username, handler);
        } else if (userType.equals("DRIVER")) {
            driverHandlers.put(username, handler);
        }
    }
    
    public void unregisterClientHandler(String username, String userType) {
        if (userType.equals("CUSTOMER")) {
            customerHandlers.remove(username);
            customerDriverPairs.remove(username);
        } else if (userType.equals("DRIVER")) {
            driverHandlers.remove(username);
            customerDriverPairs.entrySet().removeIf(entry -> entry.getValue().equals(username));
        }
    }

    @Override
    public void addCustomer(String username, String password) {
        if (!customers.containsKey(username)) {
            Customer customer = new Customer(username, password);
            customers.put(username, customer);
        }
    }

    @Override
    public void addDriver(String username, String password) {
        if (!drivers.containsKey(username)) {
            Driver driver = new Driver(username, password);
            drivers.put(username, driver);
        }
    }
    
    @Override
    public boolean authenticateUser(String username, String password) {
        Customer customer = customers.get(username);
        if (customer != null && customer.getPassword().equals(password)) {
            return true;
        }
        
        Driver driver = drivers.get(username);
        if (driver != null && driver.getPassword().equals(password)) {
            return true;
        }
        
        return false;
    }

    @Override
    public void requestRide(String username, String location, String destination, ClientHandler handler) {
        Customer customer = getCustomer(username);
        
        if (customer == null) {
            customer = new Customer(username, "");
            addCustomer(username, "");
        }
        customer.setCurrentLocation(location);
        customer.setDestination(destination);
        
        int availableDriversCount = 0;
        
        for (Map.Entry<String, ClientHandler> entry : driverHandlers.entrySet()) {
            String driverName = entry.getKey();
            ClientHandler driverHandler = entry.getValue();
            Driver driver = getDriver(driverName);
            if (isPairedDriver(driverName)) {
                continue;
            }
            driverHandler.sendMessage("RIDE REQUEST: Customer " + username + 
                                   " needs pickup at " + location + 
                                   " and destination is " + destination);
            availableDriversCount++;
        }
        if (availableDriversCount > 0) {
            handler.sendMessage("Your ride request has been sent to " + availableDriversCount + 
                             " available drivers.");
            handler.sendMessage("Please wait for a driver to accept your request. Once accepted, you can chat directly.");
        } else {
            handler.sendMessage("No drivers are currently available. Please try again later.");
        }
    }
    
    private boolean isPairedDriver(String driverName) {
        return customerDriverPairs.containsValue(driverName);
    }

    @Override
    public void acceptRide(String driverUsername, String customerUsername, ClientHandler driverHandler) {
        ClientHandler customerHandler = getCustomerHandler(customerUsername);
        
        if (customerHandler != null) {
            customerDriverPairs.put(customerUsername, driverUsername);
            
            customerHandler.sendMessage("Driver " + driverUsername + " has accepted your ride request!");
            customerHandler.sendMessage("--- PRIVATE CHAT STARTED: You can now message your driver directly ---");
            
            driverHandler.sendMessage("You have accepted " + customerUsername + "'s ride request.");
            driverHandler.sendMessage("--- PRIVATE CHAT STARTED: You can now message your customer directly ---");
            
            Driver driver = getDriver(driverUsername);
            if (driver == null) {
                driver = new Driver(driverUsername, "");
                addDriver(driverUsername, "");
            }
            driver.setAvaialable(false);
        } else {
            driverHandler.sendMessage("Customer " + customerUsername + " not found or offline.");
        }
    }

    @Override
    public void listAvailableRequests(String driverUsername, ClientHandler handler) {
        boolean hasRequests = false;
        
        for (String customerName : customerHandlers.keySet()) {
            Customer customer = customers.get(customerName);
            
            if (customer != null && customer.getCurrentLocation() != null && 
                !customerDriverPairs.containsKey(customerName)) {
                handler.sendMessage("Customer " + customerName + " needs pickup at " + customer.getCurrentLocation());
                hasRequests = true;
            }
        }
        
        if (!hasRequests) {
            handler.sendMessage("No pending ride requests available.");
        }
    }

    @Override
    public void sendHelpMessage(String userType, ClientHandler handler) {
        if ("CUSTOMER".equals(userType)) {
            handler.sendMessage("Available commands:\n" +
                "/request [location] - [destination] - Request a ride from your location\n" +
                "/help - Show this help message");
        } else if ("DRIVER".equals(userType)) {
            handler.sendMessage("Available commands:\n" +
                "/available - List all available ride requests\n" +
                "/accept [customer] - Accept a specific customer's ride request\n" +
                "/help - Show this help message");
        }
    }

    @Override
    public void notifyRideAccepted(String customerName, String driverName, 
                                   ClientHandler customerHandler, ClientHandler driverHandler) {
        customerHandler.sendMessage("Driver " + driverName + " has accepted your ride request!");
        driverHandler.sendMessage("You have accepted " + customerName + "'s ride request. You are now connected.");
    }
    
    @Override
    public Customer getCustomer(String username) {
        return customers.get(username);
    }

    @Override
    public Driver getDriver(String username) {
        return drivers.get(username);
    }
    
    public ClientHandler getCustomerHandler(String username) {
        return customerHandlers.get(username);
    }
    
    public ClientHandler getDriverHandler(String username) {
        return driverHandlers.get(username);
    }
    
    public String getPairedDriverForCustomer(String customerName) {
        return customerDriverPairs.get(customerName);
    }
    
    public String getPairedCustomerForDriver(String driverName) {
        for (Map.Entry<String, String> entry : customerDriverPairs.entrySet()) {
            if (entry.getValue().equals(driverName)) {
                return entry.getKey();
            }
        }
        return null;
    }
}