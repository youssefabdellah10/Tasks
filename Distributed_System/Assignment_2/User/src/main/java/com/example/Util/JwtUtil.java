package com.example.Util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import java.security.Key;
import java.nio.charset.StandardCharsets;
import javax.crypto.spec.SecretKeySpec;

@ApplicationScoped
public class JwtUtil {
    
    private Key key;
    // This secret key should be the same across all microservices
    private static final String SECRET_KEY = "DistributedSystemAssignment2SecretKey";
    
    @PostConstruct
    public void init() {
        // Use a fixed secret key instead of generating a new one each time
        key = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), 
                               SignatureAlgorithm.HS256.getJcaName());
    }
    
    public String generateToken(String username, String role) {
        return generateToken(username, role, null);
    }
    
    public String generateToken(String username, String role, String companyUsername) {
        var builder = Jwts.builder()
                .setSubject(username)
                .claim("role", role);
                
        if (companyUsername != null) {
            builder.claim("companyUsername", companyUsername);
        }
        
        return builder.signWith(key)
                .compact();
    }
    
    public Claims validateToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    public String getUsernameFromToken(String token) {
        return validateToken(token).getSubject();
    }
    
    public String getRoleFromToken(String token) {
        return validateToken(token).get("role", String.class);
    }
    
    public String getCompanyUsernameFromToken(String token) {
        Claims claims = validateToken(token);
        if (claims.containsKey("companyUsername")) {
            return claims.get("companyUsername", String.class);
        }
        return null;
    }
}
