// AdminController.java
package com.skillsphere.backend.controller;

import com.skillsphere.backend.model.Subscription;
import com.skillsphere.backend.model.SubscriptionPlan;
import com.skillsphere.backend.service.SubscriptionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private SubscriptionService subscriptionService;

    @GetMapping("/subscriptions")
    public ResponseEntity<List<Subscription>> getAllSubscriptions() {
        logger.info("Admin fetching all subscriptions");
        return ResponseEntity.ok(subscriptionService.getAllSubscriptions());
    }

    @PostMapping("/subscriptions")
    public ResponseEntity<?> createSubscription(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.parseLong(request.get("userId").toString());
            String plan = request.get("plan").toString();
            logger.info("Admin creating subscription for userId: {}, plan: {}", userId, plan);
            Subscription subscription = subscriptionService.createSubscription(userId, plan);
            return ResponseEntity.ok(subscription);
        } catch (Exception e) {
            logger.error("Failed to create subscription: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to create subscription: " + e.getMessage()));
        }
    }

    @GetMapping("/subscription-plans")
    public ResponseEntity<List<SubscriptionPlan>> getAllSubscriptionPlans() {
        logger.info("Admin fetching all subscription plans");
        return ResponseEntity.ok(subscriptionService.getAllSubscriptionPlans());
    }

    @PostMapping("/subscription-plans")
    public ResponseEntity<?> createSubscriptionPlan(@RequestBody Map<String, Object> request) {
        try {
            String name = request.get("name").toString();
            String description = request.get("description").toString();
            double price = Double.parseDouble(request.get("price").toString());
            logger.info("Admin creating subscription plan: {}, description: {}, price: {}", name, description, price);
            SubscriptionPlan plan = subscriptionService.createSubscriptionPlan(name, description, price);
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            logger.error("Failed to create subscription plan: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to create subscription plan: " + e.getMessage()));
        }
    }

    @PutMapping("/subscription-plans/{id}")
    public ResponseEntity<?> updateSubscriptionPlan(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        try {
            logger.info("Received update request for plan id: {}, data: {}", id, request);

            String name = request.get("name") != null ? request.get("name").toString() : null;
            String description = request.get("description") != null ? request.get("description").toString() : null;
            String priceStr = request.get("price") != null ? request.get("price").toString() : null;

            if (name == null || name.trim().isEmpty()) {
                logger.error("Plan name cannot be empty for plan id: {}", id);
                return ResponseEntity.badRequest().body(Map.of("message", "Plan name cannot be empty"));
            }
            if (description == null || description.trim().isEmpty()) {
                logger.error("Description cannot be empty for plan id: {}", id);
                return ResponseEntity.badRequest().body(Map.of("message", "Description cannot be empty"));
            }
            if (priceStr == null || priceStr.trim().isEmpty()) {
                logger.error("Price cannot be empty for plan id: {}", id);
                return ResponseEntity.badRequest().body(Map.of("message", "Price cannot be empty"));
            }

            double price;
            try {
                price = Double.parseDouble(priceStr);
                if (price < 0) {
                    logger.error("Price cannot be negative for plan id: {}", id);
                    return ResponseEntity.badRequest().body(Map.of("message", "Price cannot be negative"));
                }
            } catch (NumberFormatException e) {
                logger.error("Invalid price format for plan id: {}: {}", id, priceStr);
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid price format"));
            }

            logger.info("Admin updating subscription plan id: {}, name: {}, description: {}, price: {}", id, name, description, price);
            SubscriptionPlan updatedPlan = subscriptionService.updateSubscriptionPlan(id, name, description, price);
            return ResponseEntity.ok(updatedPlan);
        } catch (IllegalArgumentException e) {
            logger.error("Validation error updating subscription plan id: {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error updating subscription plan id: {}: {}", id, e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error: " + (e.getMessage() != null ? e.getMessage() : "Unknown error")));
        }
    }

    @DeleteMapping("/subscription-plans/{id}")
    public ResponseEntity<?> deleteSubscriptionPlan(@PathVariable Long id) {
        try {
            logger.info("Admin deleting subscription plan id: {}", id);
            subscriptionService.deleteSubscriptionPlan(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Failed to delete subscription plan id: {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to delete subscription plan: " + e.getMessage()));
        }
    }
}