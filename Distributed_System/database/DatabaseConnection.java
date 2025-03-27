package database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {
    private static final String URL = "jdbc:postgresql://localhost:5432/uber-db"; 
    private static final String USER = "postgres"; 
    private static final String PASSWORD = "1234"; 

    private static Connection connection;

    public static Connection getConnection() {
        if (connection == null) {
            try {
                // Explicitly load the PostgreSQL driver
                Class.forName("org.postgresql.Driver");
                connection = DriverManager.getConnection(URL, USER, PASSWORD);
                System.out.println("Connected to PostgreSQL database successfully!");
            } catch (ClassNotFoundException e) {
                System.err.println("PostgreSQL JDBC Driver not found. Add it to your classpath.");
                e.printStackTrace();
            } catch (SQLException e) {
                System.err.println("Failed to connect to the PostgreSQL database. Check your URL, username, and password.");
                e.printStackTrace();
                throw new RuntimeException("Failed to connect to the PostgreSQL database");
            }
        }
        return connection;
    }
}