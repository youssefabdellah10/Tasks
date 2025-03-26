package client;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;
import java.security.UnrecoverableEntryException;
import java.util.Scanner;

public class Client {

    private Socket socket;
    private BufferedReader reader;
    private BufferedWriter writer;
    private UberService uberService = UberService.getInstance();
    private String userType; 

    public Client(Socket socket, String username, String userType) {
        try {
            this.socket = socket;
            this.reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            this.writer = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
            this.username = username;
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
            Scanner scanner = new Scanner(System.in);
            while (!isUserAuthenticated) {
                System.out.println("Tab 1 for login, Tab 2 for register");
                String choice = scanner.nextLine();
                if (choice.equals("1")) {
                    writer.write("login\n");
                    writer.flush();
                    System.out.println("Welcome to login page ");
                    System.out.println("Enter your username: ");
                    String username = scanner.nextLine();
                    System.out.println("Enter your password: ");
                    String password = scanner.nextLine();
                    if (userType.equalsIgnoreCase("CUSTOMER")) {
                        Customer customer = uberService.getCustomers().get(username);
                        if(customer !=null) {
                         if (customer.getPassword().equals(password)) {
                            isUserAuthenticated = true;
                            System.out.println("\n=== Welcome to the Uber App ===");
                                System.out.println("Commands:");
                                System.out.println("/request [pickup location] - [destination] - Request a ride");
                                System.out.println("/help - Show this help message");
                            } else {
                                System.out.println("Invalid password");
                         }
                         System.out.println("User not found");
                        }
                        
                    }
                    else if (userType.equalsIgnoreCase("DRIVER")) {
                         Driver driver = uberService.getDrivers().get(username);
                        if(driver !=null) {
                         if (driver.getPassword().equals(password)) {
                            isUserAuthenticated = true;
                            System.out.println("\n=== Welcome to the Uber App ===");
                                System.out.println("Commands:");
                                System.out.println("/available - List all available ride requests");
                                System.out.println("/accept [customer] - Accept a specific customer's ride request");
                                System.out.println("/help - Show this help message");
                            } else {
                                System.out.println("Invalid password");
                         }
                         System.out.println("User not found");
                        
                    }
                }
            }
           else if(choice.equals("2")) {
                writer.write("register\n");
                writer.flush();
                System.out.println("Welcome to registeration page ");
                System.out.println("Enter your username: ");
                String username = scanner.nextLine();
                System.out.println("Enter your password: ");
                String password = scanner.nextLine();
                if (userType.equalsIgnoreCase("CUSTOMER")) {
                    if(uberService.getCustomers().containsKey(username)) {
                        System.out.println("Customer already exists");
                        continue;
                    }
                    uberService.addCustomer(username, password);
                    System.out.println("Registered successfully");
                    isUserAuthenticated = true;
                    System.out.println("\n=== Welcome to the Uber App ===");
                    System.out.println("Commands:");
                    System.out.println("/request [pickup location] - [destination] - Request a ride");
                    System.out.println("/help - Show this help message");
                } else if (userType.equalsIgnoreCase("DRIVER")) {
                    if (uberService.getDrivers().containsKey(username)) {
                        System.out.println("Driver already exists");
                        continue;
                    }
                    uberService.addDriver(username, password);
                    System.out.println("Registered successfully");
                    isUserAuthenticated = true;
                    System.out.println("\n=== Welcome to the Uber App ===");
                    System.out.println("Commands:");
                    System.out.println("/available - List all available ride requests");
                    System.out.println("/accept [customer] - Accept a specific customer's ride request");
                    System.out.println("/help - Show this help message");
                }

           }
              

            } 
            System.out.println("===========================\n");
            
            
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
           
            
            System.out.println("Are you a driver or customer? (d/c): ");
            String userTypeInput = scn.nextLine().toLowerCase();
            String userType = userTypeInput.startsWith("d") ? "DRIVER" : "CUSTOMER";
            
            Socket socket = new Socket("localhost", 5056);
            Client client = new Client(socket, userType);
            
            client.listenForMessages();
            
            client.sendMessage();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}