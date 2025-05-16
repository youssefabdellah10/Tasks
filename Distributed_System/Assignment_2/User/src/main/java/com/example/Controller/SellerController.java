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
    SellerService sellerService;    @POST
    @Path("/create")
    @Produces(MediaType.APPLICATION_JSON)
    public Response createSeller( @QueryParam("companyName") String companyName  ,@QueryParam("name") String name) {
        try {
             Seller seller=sellerService.generateSellerAccount(companyName,name);
             java.util.Map<String, Object> responseObj = new java.util.HashMap<>();
             responseObj.put("success", true);
             responseObj.put("message", "Seller created successfully");
             responseObj.put("username", seller.getUsername());
             responseObj.put("password", seller.getPassword());
             
            return Response.status(Response.Status.CREATED)
                    .entity(responseObj)
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            java.util.Map<String, Object> errorObj = new java.util.HashMap<>();
            errorObj.put("success", false);
            errorObj.put("error", e.getMessage());
            
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(errorObj)
                    .build();
        }
    }
}
