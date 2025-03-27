package Uber;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
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
    private Map<String, String> driverPendingOffers = new HashMap<>();
    private Map<String, RideStatus> rideStatus = new HashMap<>();
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
            if(!customers.containsKey(username)){
                customers.put(username, new Customer(username, ""));
            }
        } else if (userType.equals("DRIVER")) {
            driverHandlers.put(username, handler);
            if(!drivers.containsKey(username)){
                drivers.put(username, new Driver(username, ""));
            }
        }
    }
    
    public void unregisterClientHandler(String username, String userType) {
        if (userType.equals("CUSTOMER")) {
            customerHandlers.remove(username);
            customerDriverPairs.remove(username);
            
            driverPendingOffers.entrySet().removeIf(entry -> entry.getValue().equals(username));
        } else if (userType.equals("DRIVER")) {
            driverHandlers.remove(username);
            customerDriverPairs.entrySet().removeIf(entry -> entry.getValue().equals(username));
            
            driverPendingOffers.remove(username);
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
    public void requestRide(String username, String location, String destination, ClientHandler handler) {
        Customer customer = getCustomer(username);
        customer.setCurrentLocation(location);
        customer.setDestination(destination);
        
        List<String> drivers = new ArrayList<String>();
        
        for (Map.Entry<String, ClientHandler> entry : driverHandlers.entrySet()) {
            if (isPairedDriver(entry.getKey())) {
                continue;
            }
            entry.getValue().sendMessage("Ride request from " + username + " at " + location+ " to " + destination);
            drivers.add(entry.getKey());
        }
        if (drivers.size() > 0) {
            handler.sendMessage("Your ride request has been sent to " + drivers.size() + 
                             " available drivers.");
            handler.sendMessage("Please wait for a driver to accept your request.");
        } else {
            handler.sendMessage("No drivers are currently available. Please try again later.");
        }
    }
    
    private boolean isPairedDriver(String driverName) {
        return customerDriverPairs.containsValue(driverName);
    }

    @Override
    public void acceptOffer(String driverUsername, String customerUsername ,ClientHandler customerHandler) {
        Driver driver = getDriver(driverUsername);
        Customer customer = getCustomer(customerUsername);

        if(!driverPendingOffers.containsKey(driverUsername)) {
            customerHandler.sendMessage("You have no pending offers from driver " + driverUsername);
            return;
        }
        if(driver == null || customer == null) {
            customerHandler.sendMessage("Driver or customer not found.");
            return;
        }
        driverPendingOffers.remove(driverUsername);
        driver.setAvaialable(false);
        customer.setHasAvtiveRide(true);
        customerDriverPairs.put(customerUsername, driverUsername);
        rideStatus.put(driverUsername, RideStatus.ACCEPTED);
        ClientHandler driverHandler = getDriverHandler(driverUsername);
        if(driverHandler != null){
            notifyRideAccepted(customerUsername, driverUsername, customerHandler, driverHandler);
        } else {
            customerHandler.sendMessage("Driver " + driverUsername + " not found or offline.");
        }
    }

    @Override
    public void declineOffer(String driverUsername, String customerUsername, ClientHandler customerHandler) {
        if (driverPendingOffers.containsKey(driverUsername) && 
            driverPendingOffers.get(driverUsername).equals(customerUsername))
            {
            driverPendingOffers.remove(driverUsername);
            }
        ClientHandler driverHandler = getDriverHandler(driverUsername);
        if (driverHandler != null) {
            driverHandler.sendMessage("Customer " + customerUsername + " has declined your offer.");
            customerHandler.sendMessage("You have declined the offer from driver " + driverUsername);
        }
    
    }

    @Override
    public void acceptRide(String driverUsername, String customerUsername, ClientHandler driverHandler) {
        Customer customer = getCustomer(customerUsername);
        if (customer == null || customer.getCurrentLocation() == null) {
            driverHandler.sendMessage("Customer " + customerUsername + " is not requesting a ride.");
            return;
        }
        
        if (customerDriverPairs.containsKey(customerUsername)) {
            driverHandler.sendMessage("Customer " + customerUsername + " already has an assigned driver.");
            return;
        }
        
        ClientHandler customerHandler = getCustomerHandler(customerUsername);
        
        if (customerHandler == null) {
            driverHandler.sendMessage("Customer " + customerUsername + " appears to be offline.");
            return;
        }
        driverHandler.sendMessage("Please enter the fare for this ride using: /offer " + customerUsername + " [amount]");
    }

    public void processOfferCommand(String driverUsername, String customerUsername, double fare, ClientHandler driverHandler) {
        sendOffer(driverUsername, customerUsername, fare, driverHandler);
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
    public HashMap<String, Customer> getCustomers() {
        return (HashMap<String, Customer>) customers;
    }
    public HashMap<String, Driver> getDrivers() {
        return (HashMap<String, Driver>) drivers;
    }
    public HashMap<String, ClientHandler> getCustomerHandlers() {
        return (HashMap<String, ClientHandler>) customerHandlers;
    }
    public HashMap<String, ClientHandler> getDriverHandlers() {
        return (HashMap<String, ClientHandler>) driverHandlers;
    }
    @Override
    public void sendOffer(String driverUsername, String customerUsername, double fares, ClientHandler handler) {
        if (driverPendingOffers.containsKey(driverUsername)) {
            String currentCustomer = driverPendingOffers.get(driverUsername);
            handler.sendMessage("You already have a pending offer to customer " + currentCustomer + 
                              ". Wait for response or cancel your offer before making a new one.");
            return;
        }
        ClientHandler customerHandler = getCustomerHandler(customerUsername);
        if (customerHandler != null) {
            driverPendingOffers.put(driverUsername, customerUsername);
            
            customerHandler.sendMessage("Driver " + driverUsername + " has offered a fare of " + fares + 
                                      ". Use /accept " + driverUsername + " to accept or /decline " + 
                                      driverUsername + " to decline.");
            handler.sendMessage("You have offered a fare of " + fares + " to " + customerUsername);
        } else {
            handler.sendMessage("Customer " + customerUsername + " not found or offline.");
        }
    }

    private boolean isPairedWithCustomer(String driverUsername, String customerUsername) {
        String pairedDriver = customerDriverPairs.get(customerUsername);
        return pairedDriver != null && pairedDriver.equals(driverUsername);
    }

    private void cleanRide(String customerUsername, String driverUsername) {
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

    @Override
    public void updateRideStatus(String driverUsername, String customerUsername, RideStatus status,ClientHandler driverHandler) {
        if(!isPairedWithCustomer(driverUsername, customerUsername)) {
            driverHandler.sendMessage("You are not paired with customer " + customerUsername);
            return;
        }
        rideStatus.put(driverUsername, status);
        ClientHandler customerHandler = getCustomerHandler(customerUsername);
        if (customerHandler != null) {
            String statusMessage;
            switch (status) {
                case ON_THE_WAY:
                    statusMessage = "Driver " + driverUsername + " is on the way to your pickup location.";
                    break;
                case ARRIVED:
                    statusMessage = "Driver " + driverUsername + " has arrived at your pickup location.";
                    break;
                case STARTED:
                    statusMessage = "Your ride with driver " + driverUsername + " has started.";
                    break;
                case COMPLETED:
                    statusMessage = "Your ride has been completed. Thank you for using our service!";
                    cleanRide(customerUsername, driverUsername);
                    break;
                case CANCELED:
                    statusMessage = "Your ride has been canceled by driver " + driverUsername + ".";
                    cleanRide(customerUsername, driverUsername);
                    break;
                default:
                    statusMessage = "Your ride status has been updated to: " + status;
            }
            
            customerHandler.sendMessage(statusMessage);
            driverHandler.sendMessage("Ride status updated to: " + status);
        } else {
            driverHandler.sendMessage("Customer appears to be offline, but status was updated.");
        }
    }
}