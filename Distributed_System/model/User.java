package model;

public class User {
    private String username;
    private String password;
    private String userType;

    public User(String username, String password, String userType) {
        this.username = username;
        this.password = password;
        this.userType = userType;
    }

    public String getUsername() {
        return this.username;
    }

    public String getPassword() {
        return this.password;
    }
    public String getUserType() {
        return this.userType;
    }
}
