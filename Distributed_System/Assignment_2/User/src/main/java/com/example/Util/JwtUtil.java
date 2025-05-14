package com.example.Util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import java.security.Key;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.spec.SecretKeySpec;

@ApplicationScoped
public class JwtUtil {
    
    private Key key;
    private static final String SECRET_KEY = "DistributedSystemAssignment2SecretKey";
    private static final long EXPIRATION_TIME = 3600000; 
    
    @PostConstruct
    public void init() {
        key = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), 
                               SignatureAlgorithm.HS256.getJcaName());
    }
    
    public String generateToken(String username, String role) {
        return generateToken(username, role, null);
    }
      public String generateToken(String username, String role, String companyUsername) {
        // Calculate expiration time
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);
        
        var builder = Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
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
