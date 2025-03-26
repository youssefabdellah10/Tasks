package Uber;

import model.Customer;
import model.Driver;
import serverSide.ClientHandler;

public interface UberService {
    void addCustomer(String username, String password);
    void addDriver(String username, String password);
    boolean authenticateUser(String username, String password);
    
    void requestRide(String username, String location , String des , ClientHandler handler);
    void acceptRide(String driverUsername, String customerUsername,ClientHandler handler);
    void listAvailableRequests(String driverUsername, ClientHandler handler);
    
    Customer getCustomer(String username);
    Driver getDriver(String username);
    
    void sendHelpMessage(String userType, ClientHandler handler);
    void notifyRideAccepted(String customerName, String driverName, 
                            ClientHandler customerHandler, ClientHandler driverHandler);
}