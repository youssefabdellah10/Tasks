package com.example.Controller;

import com.example.Service.UserService;

import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Response;
@Path("/user")
public class UserController {
    @Inject
    UserService userService;
    @POST
    @Path("/login")
    public Response login(@QueryParam("username") String username, @QueryParam("password") String password) {
        try {
            boolean isLoggedIn = userService.login(username, password);
            if (isLoggedIn) {
                return Response.status(Response.Status.OK)
                        .entity("Login successful")
                        .build();
            } else {
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity("Invalid credentials")
                        .build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error during login: " + e.getMessage())
                    .build();
        }
    }
}
