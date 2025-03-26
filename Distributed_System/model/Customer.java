package model;

public class Customer extends User {
    private String CurrentLocation;
    private String Destination;
    private boolean hasAvtiveRide;

    public Customer(String username, String password) {
        super(username, password, "Customer");
        this.hasAvtiveRide = false;
    }
    public String getCurrentLocation() {
        return CurrentLocation;
    }
    public void setCurrentLocation(String currentLocation) {
        CurrentLocation = currentLocation;
    }
    public String getDestination() {
        return Destination;
    }
    public void setDestination(String destination) {
        this.Destination = destination;
    }
    public boolean isHasAvtiveRide() {
        return hasAvtiveRide;
    }
    public void setHasAvtiveRide(boolean hasAvtiveRide) {
        this.hasAvtiveRide = hasAvtiveRide;
    }
}
