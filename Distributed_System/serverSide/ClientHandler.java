package serverSide;

import Uber.*;
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
            System.out.println("Command received from " + username + ": " + message);
            handleCommand(message);
            return;
        }
        if (message.trim().isEmpty()) {
            return;
        }
    }
    
    private void handleCommand(String command) {
        if (command.startsWith("/request ")) {
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
            return;
        }

        String[] parts = command.split(" ", 3);
        String cmd = parts[0].toLowerCase();
        
        switch (cmd) {
            case "/accept":
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
                break;
                
            case "/decline":
                if (userType.equals("CUSTOMER") && parts.length > 1) {
                    String driverName = parts[1];
                    uberService.declineOffer(driverName, username, this);
                } else {
                    sendMessage("Usage: /decline [driver username]");
                }
                break;
                    
            case "/offer":
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
                        "/request [pickup location] to [destination] - Request a ride\n" +
                        "/accept [driver] - Accept a ride offer from a driver\n" +
                        "/decline [driver] - Decline a ride offer from a driver\n" +
                        "/help - Show this help message");
                } else {
                    sendMessage("Available commands:\n" +
                        "/available - List all available ride requests\n" +
                        "/accept [customer] - Begin the process of accepting a customer's ride\n" +
                        "/offer [customer] [fare] - Send a fare offer to a customer\n" +
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