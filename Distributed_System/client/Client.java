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
    private String username;
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
            writer.write(username + ":" + userType + "\n");
            writer.flush();
            
            System.out.println("\n=== Welcome to the Uber App ===");
            if (userType.equalsIgnoreCase("CUSTOMER")) {
                System.out.println("Commands:");
                System.out.println("/request [pickup location] - [destination] - Request a ride");
                System.out.println("/help - Show this help message");
            } else {
                System.out.println("Commands:");
                System.out.println("/available - List all available ride requests");
                System.out.println("/accept [customer] - Accept a specific customer's ride request");
                System.out.println("/help - Show this help message");
            }
            System.out.println("===========================\n");
            
            Scanner scanner = new Scanner(System.in);
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
            System.out.println("Enter your username: ");
            String username = scn.nextLine();
            
            System.out.println("Are you a driver or customer? (d/c): ");
            String userTypeInput = scn.nextLine().toLowerCase();
            String userType = userTypeInput.startsWith("d") ? "DRIVER" : "CUSTOMER";
            
            Socket socket = new Socket("localhost", 5056);
            Client client = new Client(socket, username, userType);
            
            client.listenForMessages();
            
            client.sendMessage();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}