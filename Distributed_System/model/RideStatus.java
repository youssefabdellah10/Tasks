package model;
public enum RideStatus {
    ACCEPTED,     // Driver accepted the ride but hasn't started yet
    ON_THE_WAY,   // Driver is on the way to pickup location 
    ARRIVED,      // Driver arrived at pickup location
    STARTED,      // Ride has started with customer
    COMPLETED,    // Ride finished successfully
    CANCELED      // Ride was canceled
}
