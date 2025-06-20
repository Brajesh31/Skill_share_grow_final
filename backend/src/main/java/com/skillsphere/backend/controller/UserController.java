package com.skillsphere.backend.controller;

import com.skillsphere.backend.model.User;
import com.skillsphere.backend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
//
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @PostMapping("/{userId}/follow")
    public ResponseEntity<Map<String, Object>> followUser(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            User currentUser = userService.getUserFromToken(token);
            User userToFollow = userService.findById(userId);
            if (userToFollow == null) {
                logger.warn("User to follow not found: {}", userId);
                return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            }
            if (currentUser.getId().equals(userId)) {
                logger.warn("User {} attempted to follow themselves", userId);
                return ResponseEntity.status(400).body(Map.of("message", "Cannot follow yourself"));
            }
            userService.followUser(currentUser, userToFollow);
            logger.info("User {} followed user {}", currentUser.getId(), userId);
            return ResponseEntity.ok(getUserProfileResponse(userToFollow));
        } catch (Exception e) {
            logger.error("Failed to follow user: {}", userId, e);
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error"));
        }
    }

    @PostMapping("/{userId}/unfollow")
    public ResponseEntity<Map<String, Object>> unfollowUser(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            User currentUser = userService.getUserFromToken(token);
            User userToUnfollow = userService.findById(userId);
            if (userToUnfollow == null) {
                logger.warn("User to unfollow not found: {}", userId);
                return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            }
            userService.unfollowUser(currentUser, userToUnfollow);
            logger.info("User {} unfollowed user {}", currentUser.getId(), userId);
            return ResponseEntity.ok(getUserProfileResponse(userToUnfollow));
        } catch (Exception e) {
            logger.error("Failed to unfollow user: {}", userId, e);
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error"));
        }
    }

    private Map<String, Object> getUserProfileResponse(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("isAdmin", user.isAdmin());
        response.put("createdAt", user.getCreatedAt());
        response.put("followers", user.getFollowers());
        response.put("posts", user.getPosts());
        return response;
    }
}