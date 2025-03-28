package model;

public class Ride {
    private String customerUsername;
    private String driverUsername;
    private String pickupLocation;
    private String dropoffLocation;
    private RideStatus status;
    public void setStatus(RideStatus status) {
        this.status = status;
    }
    public Ride(String customerUsername, String driverUsername, String pickupLocation, String dropoffLocation) {
        this.customerUsername = customerUsername;
        this.driverUsername = driverUsername;
        this.pickupLocation = pickupLocation;
        this.dropoffLocation = dropoffLocation;
    }
    public String getCustomerUsername() {
        return customerUsername;
    }
    public String getDriverUsername() {
        return driverUsername;
    }
    public String getPickupLocation() {
        return pickupLocation;
    }
    public String getDropoffLocation() {
        return dropoffLocation;
    }
    public RideStatus getStatus() {
        return status;
    }

}
