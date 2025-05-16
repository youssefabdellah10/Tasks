package com.example.Controller;

import java.util.List;

import com.example.Model.Notification;
import com.example.Service.NotificationService;
import com.example.Util.JwtUtil;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
@Path("/notifications")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NotificationController {
    @Inject
    private JwtUtil jwtUtil;
    
    @Inject
    private NotificationService notificationService;
      @GET
    @Path("/getall")
    public Response getAllNotifications(@Context HttpHeaders headers) {
        try {
            String authHeader = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity("Authentication token is missing or invalid")
                        .build();
            }
            
            String token = authHeader.substring(7);
            String username = jwtUtil.getUsernameFromToken(token);
            
            List<Notification> notifications = notificationService.getAllNotifications(username);
            
            return Response.status(Response.Status.OK)
                    .entity(notifications)
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error retrieving notifications: " + e.getMessage())
                    .build();
        }
    }
       
}
