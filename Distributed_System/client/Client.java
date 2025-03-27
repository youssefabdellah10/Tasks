package client;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;
import java.util.Scanner;

import Uber.*;
import model.*;

public class Client {

    private Socket socket;
    private BufferedReader reader;
    private BufferedWriter writer;
    private PlainUberService uberService = PlainUberService.getInstance();
    private String userType; 


    public Client(Socket socket,  String userType) {
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
    public void sendMessage() {
        try {
            boolean isUserAuthenticated = false;
            String username = "";
            Scanner scanner = new Scanner(System.in);
            
            
            while (!isUserAuthenticated) {
                boolean Is_admin = false;
                if (userType.equalsIgnoreCase("ADMIN")) {
                    Is_admin = true;
                    System.out.println("Welcome to admin login page ");
                    System.out.println("Enter your username: ");
                    username = scanner.nextLine();
                    System.out.println("Enter your password: ");
                    String password = scanner.nextLine();
                    if (username.equals("admin") && password.equals("123")) {
                        isUserAuthenticated = true;
                    } else {
                        System.out.println("Invalid username or password");
                        continue;
                    }
                }
                if(!Is_admin){
                System.out.println("Tab 1 for login, Tab 2 for register");
                String choice = scanner.nextLine();
                
                if (choice.equals("1")) {
                    System.out.println("Welcome to login page ");
                    System.out.println("Enter your username: ");
                    username = scanner.nextLine();
                    System.out.println("Enter your password: ");
                    String password = scanner.nextLine();
                    
                    if (userType.equalsIgnoreCase("CUSTOMER")) {
                        Customer customer = uberService.getCustomers().get(username);
                        if(customer != null) {
                            if (customer.getPassword().equals(password)) {
                                isUserAuthenticated = true;
                            } else {
                                System.out.println("Invalid password");
                                continue;
                            }
                        } else {
                            System.out.println("User not found");
                            continue;
                        }
                    }
                    else if (userType.equalsIgnoreCase("DRIVER")) {
                        Driver driver = uberService.getDrivers().get(username);
                        if(driver != null) {
                            if (driver.getPassword().equals(password)) {
                                isUserAuthenticated = true;
                            } else {
                                System.out.println("Invalid password");
                                continue;
                            }
                        } else {
                            System.out.println("User not found");
                            continue;
                        }
                    }
                    
                }
                else if(choice.equals("2")) {
                    System.out.println("Welcome to registration page ");
                    System.out.println("Enter your username: ");
                    username = scanner.nextLine();
                    System.out.println("Enter your password: ");
                    String password = scanner.nextLine();
                    writer.write(username + ":" + userType + "\n");
                    writer.flush();
                    
                    if (userType.equalsIgnoreCase("CUSTOMER")) {
                        if(uberService.getCustomers().containsKey(username)) {
                            System.out.println("Customer already exists");
                            continue;
                        }
                        uberService.addCustomer(username, password);
                        isUserAuthenticated = true;
                    } else if (userType.equalsIgnoreCase("DRIVER")) {
                        if (uberService.getDrivers().containsKey(username)) {
                            System.out.println("Driver already exists");
                            continue;
                        }
                        writer.write(username + ":" + userType + "\n");
                        writer.flush();
                        uberService.addDriver(username, password);
                        isUserAuthenticated = true;
                    }
                }
            }
            writer.write(username + ":" + userType + "\n");
            writer.flush();
            System.out.println("\n=== Welcome to the Uber App ===");
            if (userType.equalsIgnoreCase("CUSTOMER")) {
                System.out.println("Commands:");
                System.out.println("/request [pickup location] to [destination] - Request a ride");
                System.out.println("/accept [driver] - Accept a ride offer from a driver");
                System.out.println("/decline [driver] - Decline a ride offer from a driver");
                System.out.println("/help - Show this help message");
            } else {
                System.out.println("Commands:");
                System.out.println("/available - List all available ride requests");
                System.out.println("/accept [customer] - Begin the process of accepting a customer's ride");
                System.out.println("/offer [customer] [fare] - Send a fare offer to a customer");
                System.out.println("/help - Show this help message");
            }
        
            System.out.println("===========================\n");
        }
            while (socket.isConnected()) {
                String messageToSend = scanner.nextLine();
                writer.write(messageToSend);
                writer.newLine();
                writer.flush();
            }
        } catch (IOException e) {
            closeEverything(socket, reader, writer);
        }
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