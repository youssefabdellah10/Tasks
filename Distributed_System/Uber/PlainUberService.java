package Uber;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import model.*;
import serverSide.ClientHandler;
import database.DatabaseConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class PlainUberService implements UberService {

    private static PlainUberService instance;
    private Connection connection;
    
    private Map<String, ClientHandler> customerHandlers = new HashMap<>();
    private Map<String, ClientHandler> driverHandlers = new HashMap<>();
    private Map<String, String> customerDriverPairs = new HashMap<>();
    
    private PlainUberService() {
        this.connection = DatabaseConnection.getConnection();
    }
    
    public static synchronized PlainUberService getInstance() {
        if (instance == null) {
            instance = new PlainUberService();
        }
        return instance;
    }
    
    public void registerClientHandler(String username, String userType, ClientHandler handler) {
        if (userType.equals("CUSTOMER")) {
            customerHandlers.put(username, handler);
            if(getCustomer(username) == null){
                addCustomer(username, "");
            }
        } else if (userType.equals("DRIVER")) {
            driverHandlers.put(username, handler);
            if(getDriver(username) == null){
                addDriver(username, "");
            }
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
        try {
            String query = "INSERT INTO Customer (username, password) VALUES (?, ?)";
            PreparedStatement statement = connection.prepareStatement(query);
            statement.setString(1, username);
            statement.setString(2, password);
            statement.executeUpdate();
            System.out.println("Customer added successfully!");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void addDriver(String username, String password) {
        try {
            String query = "INSERT INTO Driver (username, password) VALUES (?, ?)";
            PreparedStatement statement = connection.prepareStatement(query);
            statement.setString(1, username);
            statement.setString(2, password);
            statement.executeUpdate();
            System.out.println("Driver added successfully!");
        } catch (SQLException e) {
            e.printStackTrace();
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
        if (driver == null || customer == null) {
            customerHandler.sendMessage("Customer or driver not found.");
            return;
        }
        driver.setAvaialable(false);
        customer.setHasAvtiveRide(true);
        customerDriverPairs.put(customerUsername, driverUsername);
        ClientHandler driverHandler = driverHandlers.get(driverUsername);
        if(driverHandler != null){
            notifyRideAccepted(customerUsername, driverUsername, customerHandler, driverHandler);
        }else{
            customerHandler.sendMessage("Driver " + driverUsername + " not found or offline.");
        }
    }

    @Override
    public void declineOffer(String driverUsername, String customerUsername, ClientHandler customerHandler) {
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
            Customer customer = getCustomer(customerName);
            
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
        try {
            String query = "SELECT * FROM Customer WHERE username = ?";
            PreparedStatement statement = connection.prepareStatement(query);
            statement.setString(1, username);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return new Customer(resultSet.getString("username"), resultSet.getString("password"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public Driver getDriver(String username) {
        try {
            String query = "SELECT * FROM Driver WHERE username = ?";
            PreparedStatement statement = connection.prepareStatement(query);
            statement.setString(1, username);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return new Driver(resultSet.getString("username"), resultSet.getString("password"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
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
    @Override
    public void sendOffer(String driverUsername, String customerUsername, double fares, ClientHandler handler) {
        ClientHandler customerHandler = getCustomerHandler(customerUsername);
        if (customerHandler != null) {
            customerHandler.sendMessage("Driver " + driverUsername + " has offered a fare of " + fares);
            handler.sendMessage("You have offered a fare of " + fares + " to " + customerUsername);
        } else {
            handler.sendMessage("Customer " + customerUsername + " not found or offline.");
        }
    }

    // Add a new ride request
    public void addRide(int customerId, String pickupLocation, String destination) {
        try {
            String query = "INSERT INTO Ride (customer_id, pickup_location, destination, status) VALUES (?, ?, ?, 'REQUESTED')";
            PreparedStatement statement = connection.prepareStatement(query);
            statement.setInt(1, customerId);
            statement.setString(2, pickupLocation);
            statement.setString(3, destination);
            statement.executeUpdate();
            System.out.println("Ride request added successfully!");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // Update ride status
    public void updateRideStatus(int rideId, String status) {
        try {
            String query = "UPDATE Ride SET status = ? WHERE id = ?";
            PreparedStatement statement = connection.prepareStatement(query);
            statement.setString(1, status);
            statement.setInt(2, rideId);
            statement.executeUpdate();
            System.out.println("Ride status updated to " + status);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // Assign a driver to a ride
    public void assignDriverToRide(int rideId, int driverId) {
        try {
            String query = "UPDATE Ride SET driver_id = ?, status = 'ACCEPTED' WHERE id = ?";
            PreparedStatement statement = connection.prepareStatement(query);
            statement.setInt(1, driverId);
            statement.setInt(2, rideId);
            statement.executeUpdate();
            System.out.println("Driver assigned to ride successfully!");
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
    // Check if a customer exists by username
public boolean customerExist(String username) {
    try {
        String query = "SELECT 1 FROM Customer WHERE username = ?";
        PreparedStatement statement = connection.prepareStatement(query);
        statement.setString(1, username);
        ResultSet resultSet = statement.executeQuery();
        return resultSet.next(); // Returns true if a record exists
    } catch (SQLException e) {
        e.printStackTrace();
    }
    return false; // Returns false if an exception occurs
}

// Check if a driver exists by username
public boolean driverExist(String username) {
    try {
        String query = "SELECT 1 FROM Driver WHERE username = ?";
        PreparedStatement statement = connection.prepareStatement(query);
        statement.setString(1, username);
        ResultSet resultSet = statement.executeQuery();
        return resultSet.next(); // Returns true if a record exists
    } catch (SQLException e) {
        e.printStackTrace();
    }
    return false; // Returns false if an exception occurs
}
}