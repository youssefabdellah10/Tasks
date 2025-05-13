package com.example.Controller;

import com.example.Service.UserService;
import com.example.Util.JwtUtil;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.HashMap;
import java.util.Map;

@Path("/user")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserController {
    @Inject
    private UserService userService;
    @Inject
    private JwtUtil jwtUtil;
    
    @POST
    @Path("/login")
    public Response login(@QueryParam("username") String username, @QueryParam("password") String password) {
        try {            Map<String, String> authResult = userService.authenticate(username, password);
              if ("true".equals(authResult.get("authenticated"))) {
                String role = authResult.get("role");
                String token;
                
                // Generate token with or without company information based on role
                if (UserService.ROLE_SELLER.equals(role) && authResult.containsKey("company")) {
                    token = jwtUtil.generateToken(username, role, authResult.get("company"));
                } else {
                    token = jwtUtil.generateToken(username, role);
                }
                
                Map<String, String> response = new HashMap<>();
                response.put("token", token);
                response.put("username", username);
                response.put("role", role);
                response.put("message", "Login successful");
                  // Add company information if the user is a seller
                if (UserService.ROLE_SELLER.equals(role)) {
                    // Add seller username (which is the same as the provided username)
                    response.put("sellerUsername", username);
                    
                    if (authResult.containsKey("company")) {
                        // Add company name
                        response.put("company", authResult.get("company"));
                        response.put("companyUsername", authResult.get("company"));
                    }
                }
                
                return Response.status(Response.Status.OK)
                        .entity(response)
                        .build();
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Invalid credentials");
                
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity(response)
                        .build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error during login: " + e.getMessage());
            
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(response)
                    .build();        }
    }
    
    /**
     * Validate token endpoint
     * 
     * @param token JWT token to validate
     * @return Response with token information if valid, error otherwise
     */
    @POST
    @Path("/validate-token")
    public Response validateToken(@QueryParam("token") String token) {        try {
            String username = jwtUtil.getUsernameFromToken(token);
            String role = jwtUtil.getRoleFromToken(token);
            
            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("username", username);
            response.put("role", role);
            response.put("message", "Token is valid");
              // If role is seller, retrieve company information
            if (UserService.ROLE_SELLER.equals(role)) {
                // Add seller username
                response.put("sellerUsername", username);
                
                // First try to get company info from token
                String companyUsername = jwtUtil.getCompanyUsernameFromToken(token);
                
                if (companyUsername != null) {
                    response.put("company", companyUsername);
                    response.put("companyUsername", companyUsername);
                } else {
                    // Fallback to database if not in token
                    Map<String, String> userInfo = userService.getUserInfo(username);
                    if (userInfo != null && userInfo.containsKey("company")) {
                        response.put("company", userInfo.get("company"));
                        response.put("companyUsername", userInfo.get("company"));
                    }
                }
            }
            
            return Response.status(Response.Status.OK)
                    .entity(response)
                    .build();
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid token: " + e.getMessage());
            
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(response)
                    .build();
        }
    }
}
