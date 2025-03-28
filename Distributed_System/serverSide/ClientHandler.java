package serverSide;

import model.Customer;
import model.Driver;
import model.RideStatus;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;
import java.util.ArrayList;

public class ClientHandler implements Runnable {

    public static ArrayList<ClientHandler> clients = new ArrayList<>();
    private Socket socket;
    private BufferedReader reader;
    private BufferedWriter writer;
    private String username;
    private String userType;
    private PlainUberService uberService;

    public ClientHandler(Socket socket) {
        try {
            this.socket = socket;
            this.reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            this.writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
            
            String userInfo = reader.readLine();
            String[] parts = userInfo.split(":");
            if (parts.length >= 2) {
                this.username = parts[0];
                this.userType = parts[1].toUpperCase();
            } else {
                this.username = userInfo;
            }
            
            this.uberService = PlainUberService.getInstance();
            uberService.registerClientHandler(username, userType, this);
            
            clients.add(this);
            broadcast(userType + " " + username + " connected");
        } catch (IOException e) {
            closeEverything(socket, reader, writer);
        }
    }

    @Override
    public void run() {
        String messageFromClient;
        while (socket.isConnected()) {
            try {
                while (socket.isConnected() && (messageFromClient = reader.readLine()) != null) {
                    processMessage(messageFromClient);
                    if (messageFromClient.equalsIgnoreCase("exit")) {
                        closeEverything(socket, reader, writer);
                        break;
                    }
                }
            } catch (IOException e) {
                System.out.println("Client " + username + " disconnected.");
                closeEverything(socket, reader, writer);
                break;
            }
        }
    }
    
    private void processMessage(String message) {
        if (message.startsWith("/")) {
            System.out.println("Command received from " + username + ": " + message);
            handleCommand(message);
        }
    }
    
    private void handleCommand(String command) {

        if (command.startsWith("/login ")) {
            handleLoginCommand(command);
            return;
        }

        if (command.startsWith("/register ")) {
            handleRegisterCommand(command);
            return;
        }

        if (command.startsWith("/request ")) {
            handleRequestCommand(command);
            return;
        }

        String[] parts = command.split(" ", 3);
        String cmd = parts[0].toLowerCase();
        
        switch (cmd) {
            case "/accept":
                handleAcceptCommand(parts);
                break;
                
            case "/decline":
                handleDeclineCommand(parts);
                break;
                    
            case "/offer":
                handleOfferCommand(parts);
                break;
                
            case "/available":
                handleAvailableCommand();
                break;

            case "/help":
                uberService.sendHelpMessage(userType, this);
                break;

            case "/status":
                handleStatusCommand(parts);
                break;
            case "/disconnect":
                handleDisconnectCommand();
                break;
                
            default:
                sendMessage("Unknown command. Type /help for available commands.");
        }
    }
    
    private void handleLoginCommand(String command) {
        String password = command.substring("/login ".length());
        boolean authenticated = false;

        switch (userType) {
            case "ADMIN":
                authenticated = uberService.authenticateAdmin(username, password);
                break;
            case "CUSTOMER":
                authenticated = uberService.authenticateCustomer(username, password);
                break;
            case "DRIVER":
                authenticated = uberService.authenticateDriver(username, password);
                break;
        }
        
        if (authenticated) {
            sendMessage("Login successful. Welcome, " + username + "!");
        } else {
            sendMessage("Invalid username or password. Please try again.");
        }
    }
    
    private void handleRegisterCommand(String command) {
        String password = command.substring("/register ".length());
        if (password.isEmpty()) {
            sendMessage("Password cannot be empty.");
            return;
        }
        
        boolean success = false;
        
        if (userType.equals("CUSTOMER")) {
            Customer existingCustomer = uberService.getCustomer(username);
            if (existingCustomer != null && existingCustomer.getPassword() != null && 
                !existingCustomer.getPassword().isEmpty()) {
                sendMessage("Username already exists. Please choose a different username.");
            } else {
                uberService.addCustomer(username, password);
                sendMessage("Registration successful. Welcome, " + username + "!");
                success = true;
            }
        } else if (userType.equals("DRIVER")) {
            Driver existingDriver = uberService.getDriver(username);
            if (existingDriver != null && existingDriver.getPassword() != null && 
                !existingDriver.getPassword().isEmpty()) {
                sendMessage("Username already exists. Please choose a different username.");
            } else {
                uberService.addDriver(username, password);
                sendMessage("Registration successful. Welcome, " + username + "!");
                success = true;
            }
        } else {
            sendMessage("Registration not available for this user type.");
        }
        
        if (!success) {
            sendMessage("Registration failed. Please try again with a different username.");
        }
    }
    
    private void handleRequestCommand(String command) {
        String requestContent = command.substring("/request ".length());
        if (requestContent.contains(" to ")) {
            String[] locationParts = requestContent.split(" to ", 2);
            if (locationParts.length == 2) {
                String pickupLocation = locationParts[0].trim();
                String destination = locationParts[1].trim();
                uberService.requestRide(username, pickupLocation, destination, this);
            } else {
                sendMessage("Usage: /request [pickup location] to [destination]");
            }
        } else {
            uberService.requestRide(username, requestContent, "Not specified", this);
            sendMessage("Tip: You can also specify a destination with: /request [pickup] to [destination]");
        }
    }
    
    private void handleAcceptCommand(String[] parts) {
        if (userType.equals("DRIVER") && parts.length > 1) {
            String customerName = parts[1];
            uberService.acceptRide(username, customerName, this);
        } else if (userType.equals("CUSTOMER") && parts.length > 1) {
            String driverName = parts[1];
            uberService.acceptOffer(driverName, username, this);
        } else {
            if (userType.equals("DRIVER")) {
                sendMessage("Usage: /accept [customer username]");
            } else {
                sendMessage("Usage: /accept [driver username]");
            }
        }
    }
    
    private void handleDeclineCommand(String[] parts) {
        if (userType.equals("CUSTOMER") && parts.length > 1) {
            String driverName = parts[1];
            uberService.declineOffer(driverName, username, this);
        } else {
            sendMessage("Usage: /decline [driver username]");
        }
    }
    
    private void handleOfferCommand(String[] parts) {
        if (userType.equals("DRIVER") && parts.length > 2) {
            String customerName = parts[1];
            try {
                double fare = Double.parseDouble(parts[2]);
                uberService.processOfferCommand(username, customerName, fare, this);
            } catch (NumberFormatException e) {
                sendMessage("Invalid fare amount. Please enter a valid number.");
            }
        } else {
            sendMessage("Usage: /offer [customer username] [fare amount]");
        }
    }
    
    private void handleAvailableCommand() {
        if (userType.equals("DRIVER")) {
            uberService.listAvailableRequests(username, this);
        } else {
            sendMessage("This command is only available for drivers.");
        }
    }
    
    private void handleStatusCommand(String[] parts) {
        if (!userType.equals("DRIVER")) {
            sendMessage("Only drivers can update ride status.");
            return;
        }
        
        if (parts.length < 2) {
            sendMessage("Usage: /status [STATUS_TYPE]");
            sendMessage("Available statuses: ONWAY, ARRIVED, STARTED, COMPLETED, CANCELED");
            return;
        }
        
        String statusType = parts[1].toUpperCase();
        String pairedCustomer = uberService.getPairedCustomerForDriver(username);
        
        if (pairedCustomer == null) {
            sendMessage("You don't have an active ride.");
            return;
        }
        
        try {
            RideStatus status = parseRideStatus(statusType);
            if (status != null) {
                uberService.updateRideStatus(username, pairedCustomer, status, this);
            } else {
                sendMessage("Invalid status. Use ONWAY, ARRIVED, STARTED, COMPLETED, or CANCELED.");
            }
        } catch (Exception e) {
            sendMessage("Error updating ride status: " + e.getMessage());
        }
    }
    
    private RideStatus parseRideStatus(String statusType) {
        switch (statusType) {
            case "ONWAY": return RideStatus.ON_THE_WAY;
            case "ARRIVED": return RideStatus.ARRIVED;
            case "STARTED": return RideStatus.STARTED;
            case "COMPLETED": return RideStatus.COMPLETED;
            case "CANCELED": return RideStatus.CANCELED;
            default: return null;
        }
    }

    private void handleDisconnectCommand() {
        boolean canDisconnect = true;
        String errorMessage ="";

        if(userType.equals("CUSTOMER")){
            Customer customer = uberService.getCustomer(username);
            if(customer != null && customer.isHasAvtiveRide()) {
                canDisconnect = false;
                errorMessage = "You cannot disconnect while you have an active ride.";
            }
        }else if(userType.equals("DRIVER")){
            Driver driver = uberService.getDriver(username);
            String pairedCustomer = uberService.getPairedCustomerForDriver(username);
            if(pairedCustomer != null || (driver != null && !driver.isAvaialable())) {
                canDisconnect = false;
                errorMessage = "You cannot disconnect while you have an active ride. Please complete or cancel the ride first.";
            }
        }
        if(canDisconnect) {
            sendMessage("You have been disconnected. Goodbye!");
            closeEverything(socket, reader, writer);
        } else {
            sendMessage(errorMessage);
        }
    }
    
    public void sendMessage(String message) {
        try {
            writer.write(message + "\n");
            writer.flush();
        } catch (IOException e) {
            closeEverything(socket, reader, writer);
        }
    }

    public void broadcast(String message) {
        for (ClientHandler client : clients) {
            try {
                if (client != this) {
                    client.writer.write(message + "\n");
                    client.writer.flush();
                }
            } catch (Exception e) {
                closeEverything(client.socket, client.reader, client.writer);
            }
        }
    }

    public void removeClient() {
        clients.remove(this);
        uberService.unregisterClientHandler(username, userType);
        broadcast(userType + " " + username + " disconnected");
    }

    public void closeEverything(Socket socket, BufferedReader reader, BufferedWriter writer) {
        removeClient();
        try {
            if (socket != null) {
                socket.close();
            }
            if (reader != null) {
                reader.close();
            }
            if (writer != null) {
                writer.close();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}