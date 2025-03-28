package serverSide;
import java.util.Map;
import model.*;

public class PlainUberService {

    private static PlainUberService instance;
    private final Database database;
    
    private PlainUberService() {
        database = Database.getInstance();
    }
    
    public static synchronized PlainUberService getInstance() {
        if (instance == null) {
            instance = new PlainUberService();
        }
        return instance;
    }
    

    public void registerClientHandler(String username, String userType, ClientHandler handler) {
        database.registerClientHandler(username, userType, handler);
    }
    
    public void unregisterClientHandler(String username, String userType) {
        database.unregisterClientHandler(username, userType);
    }

    
    public void addCustomer(String username, String password) {
        database.addCustomer(username, password);
    }
    
    public void addDriver(String username, String password) {
        database.addDriver(username, password);
    }
    
    public Customer getCustomer(String username) {
        return database.getCustomer(username);
    }
    
    public Driver getDriver(String username) {
        return database.getDriver(username);
    }

    
    public void requestRide(String username, String location, String destination, ClientHandler handler) {
        Customer customer = database.getCustomer(username);
        customer.setCurrentLocation(location);
        customer.setDestination(destination);
        
        int counter = 0;
        
        for (Map.Entry<String, ClientHandler> entry : database.getAllDriverHandlers().entrySet()) {
            String driverName = entry.getKey();
            if (database.isPairedDriver(driverName)) {
                continue;
            }
            entry.getValue().sendMessage("Ride request from " + username + " at " + location + " to " + destination);
            counter++;
        }
        
        if (counter > 0) {
            handler.sendMessage("Your ride request has been sent to " + counter + 
                             " available drivers.");
            handler.sendMessage("Please wait for a driver to accept your request.");
        } else {
            handler.sendMessage("No drivers are currently available. Please try again later.");
        }
    }
    
    public void acceptOffer(String driverUsername, String customerUsername, ClientHandler customerHandler) {
        Driver driver = database.getDriver(driverUsername);
        Customer customer = database.getCustomer(customerUsername);

        if (!database.hasDriverPendingOffer(driverUsername)) {
            customerHandler.sendMessage("You have no pending offers from driver " + driverUsername);
            return;
        }
        
        if (driver == null || customer == null) {
            customerHandler.sendMessage("Driver or customer not found.");
            return;
        }
        
        database.removeDriverPendingOffer(driverUsername);
        driver.setAvaialable(false);
        customer.setHasAvtiveRide(true);
        database.pairCustomerDriver(customerUsername, driverUsername);
        database.setRideStatus(driverUsername, RideStatus.ON_THE_WAY);
        
        ClientHandler driverHandler = database.getDriverHandler(driverUsername);
        if (driverHandler != null) {
            notifyRideAccepted(customerUsername, driverUsername, customerHandler, driverHandler);
        } else {
            customerHandler.sendMessage("Driver " + driverUsername + " not found or offline.");
        }
    }
    
    public void declineOffer(String driverUsername, String customerUsername, ClientHandler customerHandler) {
        if (database.hasDriverPendingOffer(driverUsername) && 
            database.getPendingOfferCustomer(driverUsername).equals(customerUsername)) {
            database.removeDriverPendingOffer(driverUsername);
        }
        
        ClientHandler driverHandler = database.getDriverHandler(driverUsername);
        if (driverHandler != null) {
            driverHandler.sendMessage("Customer " + customerUsername + " has declined your offer.");
            customerHandler.sendMessage("You have declined the offer from driver " + driverUsername);
        }
    }
    
    public void acceptRide(String driverUsername, String customerUsername, ClientHandler driverHandler) {
        Customer customer = database.getCustomer(customerUsername);
        if (customer == null || customer.getCurrentLocation() == null) {
            driverHandler.sendMessage("Customer " + customerUsername + " is not requesting a ride.");
            return;
        }
        
        if (database.getDriverForCustomer(customerUsername) != null) {
            driverHandler.sendMessage("Customer " + customerUsername + " already has an assigned driver.");
            return;
        }
        
        ClientHandler customerHandler = database.getCustomerHandler(customerUsername);
        if (customerHandler == null) {
            driverHandler.sendMessage("Customer " + customerUsername + " appears to be offline.");
            return;
        }
        
        driverHandler.sendMessage("Please enter the fare for this ride using: /offer " + customerUsername + " [amount]");
    }

    public void processOfferCommand(String driverUsername, String customerUsername, double fare, ClientHandler driverHandler) {
        if (fare <= 0) {
            driverHandler.sendMessage("Fare must be greater than zero.");
            return;
        }
        sendOffer(driverUsername, customerUsername, fare, driverHandler);
    }
    
    public void listAvailableRequests(String driverUsername, ClientHandler handler) {
        boolean hasRequests = false;
        
        for (Map.Entry<String, Customer> entry : database.getAllCustomers().entrySet()) {
            String customerName = entry.getKey();
            Customer customer = entry.getValue();
            
            if (customer.getCurrentLocation() != null && database.getDriverForCustomer(customerName) == null) {
                handler.sendMessage("Customer " + customerName + " needs pickup at " + customer.getCurrentLocation() + 
                                  " to " + (customer.getDestination() != null ? customer.getDestination() : "unspecified"));
                hasRequests = true;
            }
        }
        
        if (!hasRequests) {
            handler.sendMessage("No pending ride requests available.");
        }
    }
    
    public void sendOffer(String driverUsername, String customerUsername, double fare, ClientHandler handler) {
        if (database.hasDriverPendingOffer(driverUsername)) {
            String currentCustomer = database.getPendingOfferCustomer(driverUsername);
            handler.sendMessage("You already have a pending offer to customer " + currentCustomer + 
                              ". Wait for response or cancel your offer before making a new one.");
            return;
        }
        
        ClientHandler customerHandler = database.getCustomerHandler(customerUsername);
        if (customerHandler != null) {
            database.addDriverPendingOffer(driverUsername, customerUsername);
            
            customerHandler.sendMessage("Driver " + driverUsername + " has offered a fare of $" + fare + 
                                      ". Use /accept " + driverUsername + " to accept or /decline " + 
                                      driverUsername + " to decline.");
            handler.sendMessage("You have offered a fare of " + fare + " to " + customerUsername);
        } else {
            handler.sendMessage("Customer " + customerUsername + " not found or offline.");
        }
    }

    public void updateRideStatus(String driverUsername, String customerUsername, RideStatus status, ClientHandler driverHandler) {
        if (!database.isPairedWithCustomer(driverUsername, customerUsername)) {
            driverHandler.sendMessage("You are not paired with customer " + customerUsername);
            return;
        }
        
        database.setRideStatus(driverUsername, status);
        ClientHandler customerHandler = database.getCustomerHandler(customerUsername);
        
        String statusMessage = getStatusMessage(driverUsername, status);
        
        if (customerHandler != null) {
            customerHandler.sendMessage(statusMessage);
            driverHandler.sendMessage("Ride status updated to: " + status);
            
            if (status == RideStatus.COMPLETED || status == RideStatus.CANCELED) {
                database.cleanRide(customerUsername, driverUsername);
            }
        } else {
            driverHandler.sendMessage("Customer appears to be offline, but status was updated.");
        }
    }
    
    private String getStatusMessage(String driverUsername, RideStatus status) {
        switch (status) {
            case ON_THE_WAY:
                return "Driver " + driverUsername + " is on the way to your pickup location.";
            case ARRIVED:
                return "Driver " + driverUsername + " has arrived at your pickup location.";
            case STARTED:
                return "Your ride with driver " + driverUsername + " has started.";
            case COMPLETED:
                return "Your ride has been completed. Thank you for using our service!";
            case CANCELED:
                return "Your ride has been canceled by driver " + driverUsername + ".";
            default:
                return "Your ride status has been updated to: " + status;
        }
    }
    
    public void sendHelpMessage(String userType, ClientHandler handler) {
        if ("CUSTOMER".equals(userType)) {
            handler.sendMessage("Available commands:\n" +
                "/request [pickup location] to [destination] - Request a ride\n" +
                "/accept [driver] - Accept a ride offer from a driver\n" +
                "/decline [driver] - Decline a ride offer from a driver\n" +
                "/disconnect - Disconnect from the server (not available during active rides)\n" +
                "/help - Show this help message");
        } else if ("DRIVER".equals(userType)) {
            handler.sendMessage("Available commands:\n" +
                "/available - List all available ride requests\n" +
                "/accept [customer] - Begin the process of accepting a customer's ride\n" +
                "/offer [customer] [fare] - Send a fare offer to a customer\n" +
                "/status [ONWAY|ARRIVED|STARTED|COMPLETED|CANCELED] - Update ride status\n" +
                "/disconnect - Disconnect from the server (not available during active rides)\n" +
                "/help - Show this help message");
        }
    }
    
    public void notifyRideAccepted(String customerName, String driverName, 
                                 ClientHandler customerHandler, ClientHandler driverHandler) {
        customerHandler.sendMessage("Driver " + driverName + " has accepted your ride request!");
        driverHandler.sendMessage("You have accepted " + customerName + "'s ride request. You are now connected.");
    }
    
    public boolean authenticateAdmin(String username, String password) {
        return database.authenticateAdmin(username, password);
    }

    public boolean authenticateCustomer(String username, String password) {
        Customer customer = database.getCustomer(username);
        return customer != null && customer.getPassword() != null && 
               !customer.getPassword().isEmpty() && 
               customer.getPassword().equals(password);
    }
    
    public boolean authenticateDriver(String username, String password) {
        Driver driver = database.getDriver(username);
        return driver != null && driver.getPassword() != null && 
               !driver.getPassword().isEmpty() && 
               driver.getPassword().equals(password);
    }
    
    public String getPairedCustomerForDriver(String driverUsername) {
        return database.getCustomerForDriver(driverUsername);
    }
    
    public String getDriverForCustomer(String customerUsername) {
        return database.getDriverForCustomer(customerUsername);
    }
}