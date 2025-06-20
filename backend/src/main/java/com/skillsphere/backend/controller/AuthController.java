package com.skillsphere.backend.controller;

import com.skillsphere.backend.model.User;
import com.skillsphere.backend.model.Admin;
import com.skillsphere.backend.service.UserService;
import com.skillsphere.backend.service.AdminService;
import io.jsonwebtoken.Jwts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.SecretKey;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private SecretKey secretKey;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        try {
            String username = credentials.get("username");
            String password = credentials.get("password");

            if (username == null || password == null) {
                logger.warn("Missing username or password in login request");
                return ResponseEntity.status(400).body(Map.of("message", "Username and password are required"));
            }

            logger.info("Login attempt for username: {}", username);

            // Try authenticating as a user
            User user = userService.authenticate(username, password);
            if (user != null) {
                String token = Jwts.builder()
                        .setSubject(user.getId().toString())
                        .signWith(secretKey)
                        .compact();
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("userId", user.getId());
                response.put("username", user.getUsername());
                response.put("isAdmin", user.isAdmin());
                logger.info("User login successful: {}", username);
                return ResponseEntity.ok(response);
            }

            // Try authenticating as an admin
            Admin admin = adminService.authenticate(username, password);
            if (admin != null) {
                String token = Jwts.builder()
                        .setSubject(admin.getId().toString())
                        .signWith(secretKey)
                        .compact();
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("userId", admin.getId());
                response.put("username", admin.getUsername());
                response.put("isAdmin", true);
                logger.info("Admin login successful: {}", username);
                return ResponseEntity.ok(response);
            }

            logger.warn("Authentication failed for username: {}", username);
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        } catch (Exception e) {
            logger.error("Login failed for username: {}", credentials.get("username"), e);
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error during login"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> credentials) {
        try {
            String username = credentials.get("username");
            String password = credentials.get("password");

            if (username == null || password == null) {
                logger.warn("Missing username or password in register request");
                return ResponseEntity.status(400).body(Map.of("message", "Username and password are required"));
            }

            logger.info("Register attempt for username: {}", username);
            User user = userService.register(username, password);
            String token = Jwts.builder()
                    .setSubject(user.getId().toString())
                    .signWith(secretKey)
                    .compact();
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("userId", user.getId());
            response.put("username", user.getUsername());
            response.put("isAdmin", user.isAdmin());
            logger.info("User registered successfully: {}", username);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Registration failed for username: {}", credentials.get("username"), e);
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error during registration", e);
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error during registration"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userId = Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();

            Map<String, Object> response = new HashMap<>();
            User user = userService.findById(Long.parseLong(userId));
            if (user != null) {
                response.put("userId", user.getId());
                response.put("username", user.getUsername());
                response.put("isAdmin", user.isAdmin());
                logger.info("Fetched current user: {}", user.getUsername());
                return ResponseEntity.ok(response);
            }

            Admin admin = adminService.findById(Long.parseLong(userId));
            if (admin != null) {
                response.put("userId", admin.getId());
                response.put("username", admin.getUsername());
                response.put("isAdmin", true);
                logger.info("Fetched current admin: {}", admin.getUsername());
                return ResponseEntity.ok(response);
            }

            logger.warn("No user or admin found for userId: {}", userId);
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        } catch (Exception e) {
            logger.error("Failed to fetch current user", e);
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired token"));
        }
    }
}