package model;

public class Driver extends User {
  
    private boolean isAvaialable;
    private double rating;
    private int totalRides;
    private String currentLocation;

    public Driver (String username, String password) {
        super(username, password, "Driver");
    }
    public boolean isAvaialable() {
        return isAvaialable;
    }
    public void setAvaialable(boolean isAvaialable) {
        this.isAvaialable = isAvaialable;
    }
    public double getRating() {
        return rating;
    }
    public void updateRating(double newRating) {
        this.rating = (this.rating * this.totalRides + newRating) / (this.totalRides + 1);
        this.totalRides++;
    }
    public int getTotalRides() {
        return totalRides;
    }
    public String getCurrentLocation() {
        return currentLocation;
    }
    public void setCurrentLocation(String currentLocation) {
        this.currentLocation = currentLocation;
    }
}