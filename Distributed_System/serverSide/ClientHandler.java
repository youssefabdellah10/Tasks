package serverSide;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;
import java.util.ArrayList;

import Uber.*;

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
                this.userType = "UNKNOWN";
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
                messageFromClient = reader.readLine();
                if (messageFromClient == null) {
                    closeEverything(socket, reader, writer);
                    break;
                }
                
                processMessage(messageFromClient);
            } catch (IOException e) {
                closeEverything(socket, reader, writer);
                break;
            }
        }
    }
    
    private void processMessage(String message) {
        if (message.startsWith("/")) {
            handleCommand(message);
            return;
        }
        if (message.trim().isEmpty()) {
            return;
        }
        
        if (userType.equals("CUSTOMER")) {
            String driverName = uberService.getPairedDriverForCustomer(username);
            if (driverName != null) {
                ClientHandler driverHandler = uberService.getDriverHandler(driverName);
                if (driverHandler != null) {
                    driverHandler.sendMessage(username + ": " + message);
                    sendMessage("You: " + message);
                }
                return;
            }
        } else if (userType.equals("DRIVER")) {
            String customerName = uberService.getPairedCustomerForDriver(username);
            if (customerName != null) {
                ClientHandler customerHandler = uberService.getCustomerHandler(customerName);
                if (customerHandler != null) {
                    customerHandler.sendMessage(username + ": " + message);
                    sendMessage("You: " + message);
                }
                return;
            }
        }
    }
    
    private void handleCommand(String command) {
        String[] parts = command.split(" ", 2);
        String cmd = parts[0].toLowerCase();
        
        switch (cmd) {
            case "/request":
                if (userType.equals("CUSTOMER") && parts.length > 1) {
                    String fullLocation = parts[1];
                    if (fullLocation.contains(" - ")) {
                        String[] locationParts = fullLocation.split(" - ", 2);
                        if (locationParts.length == 2) {
                            String pickupLocation = locationParts[0].trim();
                            String destination = locationParts[1].trim();
                            uberService.requestRide(username, pickupLocation, destination, this);
                        } else {
                            sendMessage("Usage: /request [pickup location] - [destination]");
                        }
                    } else {
                        uberService.requestRide(username, fullLocation, "Not specified", this);
                        sendMessage("Tip: You can also specify a destination with: /request [pickup] - [destination]");
                    }
                } else {
                    sendMessage("Usage: /request [pickup location] - [destination]");
                }
                break;
                
            case "/accept":
                if (userType.equals("DRIVER") && parts.length > 1) {
                    String customerName = parts[1];
                    uberService.acceptRide(username, customerName, this);
                } else {
                    sendMessage("Usage: /accept [customer username]");
                }
                break;
                
            case "/available":
                if (userType.equals("DRIVER")) {
                    uberService.listAvailableRequests(username, this);
                } else {
                    sendMessage("This command is only available for drivers.");
                }
                break;
                
            case "/help":
                if (userType.equals("CUSTOMER")) {
                    sendMessage("Available commands:\n" +
                        "/request [pickup location] - [destination] - Request a ride\n" +
                        "/help - Show this help message");
                } else {
                    sendMessage("Available commands:\n" +
                        "/available - List all available ride requests\n" +
                        "/accept [customer] - Accept a specific customer's ride request\n" +
                        "/help - Show this help message");
                }
                break;
                
            default:
                sendMessage("Unknown command. Type /help for available commands.");
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
                if (!client.username.equals(username)) {
                    client.writer.write(message + "\n");
                    client.writer.flush();
                }
            } catch (Exception e) {
                closeEverything(socket, reader, writer);
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