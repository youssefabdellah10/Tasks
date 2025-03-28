package client;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;
import java.util.Scanner;

public class Client {

    private Socket socket;
    private BufferedReader reader;
    private BufferedWriter writer;
    private String userType; 
    private volatile boolean authenticationCompleted = false;
    private volatile boolean authenticationSuccess = false;

    public Client(Socket socket, String userType) {
        try {
            this.socket = socket;
            this.reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            this.writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
            this.userType = userType;
        } catch (IOException e) {
            closeEverything(socket, reader, writer);
        }
    }

    public BufferedWriter getWriter() {
        return this.writer;
    }
    
    public void setAuthenticationStatus(boolean success) {
        this.authenticationSuccess = success;
        this.authenticationCompleted = true;
    }
    
    public void sendMessage() {
        try {
            Scanner scanner = new Scanner(System.in);
            
            if (userType.equalsIgnoreCase("ADMIN")) {
                handleAdminLogin(scanner);
            } else {
                handleUserAuthentication(scanner);
            }
            
            if (authenticationSuccess) {
                displayWelcomeMenu();
                
                while (socket.isConnected()) {
                    String messageToSend = scanner.nextLine();
                    writer.write(messageToSend);
                    writer.newLine();
                    writer.flush();
                }
            }
        } catch (IOException e) {
            closeEverything(socket, reader, writer);
        }
    }
    
    private void handleAdminLogin(Scanner scanner) throws IOException {
        while (!authenticationCompleted || !authenticationSuccess) {
            System.out.println("===== Admin Login =====");
            System.out.println("Enter your username: ");
            String username = scanner.nextLine();
            System.out.println("Enter your password: ");
            String password = scanner.nextLine();
            
            writer.write(username + ":" + userType + "\n");
            writer.flush();
            writer.write("/login " + password + "\n");
            writer.flush();
            
            waitForAuthResponse();
            
            if (!authenticationSuccess && authenticationCompleted) {
                System.out.println("Would you like to try again? (y/n)");
                String response = scanner.nextLine();
                if (response.toLowerCase().startsWith("n")) {
                    closeEverything(socket, reader, writer);
                    break;
                }
                authenticationCompleted = false;
            }
        }
    }
    
    private void handleUserAuthentication(Scanner scanner) throws IOException {
        while (!authenticationCompleted || !authenticationSuccess) {
            System.out.println("===== " + userType + " Authentication =====");
            System.out.println("1: Login");
            System.out.println("2: Register");
            System.out.print("Choice: ");
            String choice = scanner.nextLine();
            
            if (choice.equals("1") || choice.equals("2")) {
                System.out.print("Username: ");
                String username = scanner.nextLine();
                System.out.print("Password: ");
                String password = scanner.nextLine();
                
                writer.write(username + ":" + userType + "\n");
                writer.flush();
                
                String authCommand = choice.equals("2") ? "/register" : "/login";
                writer.write(authCommand + " " + password + "\n");
                writer.flush();
                
                waitForAuthResponse();
                
                if (!authenticationSuccess && authenticationCompleted) {
                    authenticationCompleted = false;
                }
            } else {
                System.out.println("Invalid choice. Please enter 1 or 2.");
            }
        }
    }
    
    private void waitForAuthResponse() {
        long startTime = System.currentTimeMillis();
        while (!authenticationCompleted && System.currentTimeMillis() - startTime < 5000) {
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
    
    private void displayWelcomeMenu() {
        System.out.println("\n=== Welcome to the Uber App ===");
        if (userType.equalsIgnoreCase("CUSTOMER")) {
            System.out.println("Commands:");
            System.out.println("/request [pickup location] to [destination] - Request a ride");
            System.out.println("/accept [driver] - Accept a ride offer from a driver");
            System.out.println("/cancel - Cancel your current ride request");
            System.out.println("/decline [driver] - Decline a ride offer from a driver");
            System.out.println("/disconnect - Disconnect from the server");
            System.out.println("/help - Show this help message");
        } else if (userType.equalsIgnoreCase("DRIVER")) {
            System.out.println("Commands:");
            System.out.println("/available - List all available ride requests");
            System.out.println("/accept [customer] - Begin the process of accepting a customer's ride");
            System.out.println("/offer [customer] [fare] - Send a fare offer to a customer");
            System.out.println("/status [ONWAY|ARRIVED|STARTED|COMPLETED|CANCELED] - Update ride status");
            System.out.println("/disconnect - Disconnect from the server");
            System.out.println("/help - Show this help message");
        } else {
            System.out.println("Admin Commands:");
            System.out.println("/status - View system status summary");
            System.out.println("/rides - View all active rides");
            System.out.println("/customers - View all registered customers");
            System.out.println("/drivers - View all registered drivers");
            System.out.println("/disconnect - Disconnect from the server");
            System.out.println("/help - Show this help message");
        }
        
        System.out.println("===========================\n");
    }

    public void listenForMessages() {
        ClientListener listener = new ClientListener(socket, reader, this);
        listener.start();
    }
    
    public void closeEverything(Socket socket, BufferedReader reader, BufferedWriter writer) {
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

    public static void main(String[] args) throws IOException {
        try {
            Scanner scn = new Scanner(System.in);

            System.out.println("Welcome to the Uber App!");
            System.out.println("Are you a driver or customer or Admin? (d/c/a): ");
            String userTypeInput = scn.nextLine().toLowerCase();
            String userType = userTypeInput.startsWith("d") ? "DRIVER" : (userTypeInput.startsWith("a") ? "ADMIN" : "CUSTOMER");
            
            Socket socket = new Socket("localhost", 5056);
            Client client = new Client(socket, userType);
            
            client.listenForMessages();
            client.sendMessage();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}