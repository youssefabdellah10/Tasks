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
                System.out.println(messageFromServer);
            } catch (IOException e) {
                client.closeEverything(socket, reader, client.getWriter());
                break;
            }
        }
    }
}