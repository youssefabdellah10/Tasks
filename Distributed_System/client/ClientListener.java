package client;

import java.io.BufferedReader;
import java.io.IOException;
import java.net.Socket;

public class ClientListener extends Thread {
    private final BufferedReader reader;
    private final Socket socket;
    private final Client client;

    public ClientListener(Socket socket, BufferedReader reader, Client client) {
        this.socket = socket;
        this.reader = reader;
        this.client = client;
    }

    @Override
    public void run() {
        String messageFromServer;
        while (socket.isConnected()) {
            try {
                messageFromServer = reader.readLine();
                if (messageFromServer == null) {
                    client.closeEverything(socket, reader, client.getWriter());
                    break;
                }
                
                if (messageFromServer.contains("Login successful")) {
                    client.setAuthenticationStatus(true);
                } else if (messageFromServer.contains("Invalid username or password") || 
                           messageFromServer.contains("Registration failed")) {
                    client.setAuthenticationStatus(false);
                } else if (messageFromServer.contains("Registration successful")) {
                    client.setAuthenticationStatus(true);
                }
                if(messageFromServer.contains("Disconnected")) {
                    System.out.println("Server disconnected. Exiting...");
                    client.closeEverything(socket, reader, client.getWriter());
                    System.exit(0);
                    break;
                }
                
                System.out.println(messageFromServer);
            } catch (IOException e) {
                client.closeEverything(socket, reader, client.getWriter());
                break;
            }
        }
    }
}