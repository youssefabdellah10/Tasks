package com.example.Controller;

import com.example.Model.Seller;
import com.example.Service.SellerService;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.QueryParam;



@Path("/seller")
public class SellerController {
    @Inject
    SellerService sellerService;
    @POST
    @Path("/create")
    @Produces(MediaType.APPLICATION_JSON)
    public Response createSeller( @QueryParam("companyName") String companyName  ,@QueryParam("name") String name) {
        try {
             Seller seller=sellerService.generateSellerAccount(companyName,name);
            return Response.status(Response.Status.CREATED)
                    .entity("Seller created successfully with username: " + seller.getUsername()+" and password: " + seller.getPassword())
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error creating seller: " + e.getMessage())
                    .build();
        }
    }
}
