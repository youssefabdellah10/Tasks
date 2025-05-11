package com.example.Controller;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import com.example.Model.Customer;
import com.example.Service.CustomerSerivce;

@Path("/customer")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CustomerController {
      
    @Inject
    CustomerSerivce customerService;
    
    // Add this simple test endpoint
    @GET
    @Path("/hello")
    @Produces(MediaType.TEXT_PLAIN)
    public String hello() {
        return "Hello, JAX-RS is working!";
    }
    
    @POST
    @Path("/register")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response registerUser(Customer customer) {
        try {
            boolean isRegistered = customerService.saveCustomer(customer);
            if (!isRegistered) {
                return Response.status(Response.Status.CONFLICT)
                        .entity("User with email " + customer.getUsername() + " already registered.")
                        .build();
            }
            return Response.status(Response.Status.CREATED)
                    .entity("Registration Complete")
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error during registration: " + e.getMessage())
                    .build();
        }
    } 
}