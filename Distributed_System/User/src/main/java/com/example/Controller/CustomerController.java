package com.example.Controller;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import com.example.Model.Customer;
import com.example.Service.CustomerSerivce;
import java.util.List;

@Path("/customer")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CustomerController {
      
    @Inject
    CustomerSerivce customerService;

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
      @GET
    @Path("/all")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllCustomers() {
        try {
            List<Customer> customers = customerService.getAllCustomers();
            if (customers == null || customers.isEmpty()) {
                return Response.status(Response.Status.NO_CONTENT)
                        .entity("No customers found")
                        .build();
            }
            return Response.status(Response.Status.OK)
                    .entity(customers)
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving customers: " + e.getMessage())
                    .build();
        }
    }
}