// SubscriptionService.java
package com.skillsphere.backend.service;

import com.skillsphere.backend.model.Subscription;
import com.skillsphere.backend.model.SubscriptionPlan;
import com.skillsphere.backend.model.User;
import com.skillsphere.backend.repository.SubscriptionPlanRepository;
import com.skillsphere.backend.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Autowired
    private UserService userService;

    public Subscription createSubscription(Long userId, String planName) {
        User user = userService.findById(userId);
        SubscriptionPlan plan = subscriptionPlanRepository.findByName(planName)
            .orElseThrow(() -> new IllegalArgumentException("Subscription plan not found: " + planName));

        Subscription subscription = new Subscription();
        subscription.setUser(user);
        subscription.setPlan(plan.getName());
        subscription.setStartDate(LocalDateTime.now());
        subscription.setEndDate(LocalDateTime.now().plusMonths(1));
        subscription.setActive(true);

        List<Subscription> activeSubs = subscriptionRepository.findByUserIdAndActive(userId, true);
        activeSubs.forEach(sub -> {
            sub.setActive(false);
            subscriptionRepository.save(sub);
        });

        return subscriptionRepository.save(subscription);
    }

    public List<Subscription> getUserSubscriptions(Long userId) {
        return subscriptionRepository.findByUserId(userId);
    }

    public List<Subscription> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }

    public SubscriptionPlan createSubscriptionPlan(String name, String description, double price) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Plan name cannot be empty");
        }
        if (subscriptionPlanRepository.existsByName(name)) {
            throw new IllegalArgumentException("Subscription plan with name '" + name + "' already exists");
        }
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("Description cannot be empty");
        }
        List<String> features = Arrays.stream(description.split("\\s*,\\s*"))
            .map(String::trim)
            .filter(f -> !f.isEmpty())
            .collect(Collectors.toList());
        if (features.isEmpty()) {
            throw new IllegalArgumentException("Description must contain at least one valid feature");
        }
        if (price < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setName(name);
        plan.setFeatures(features);
        plan.setPrice(price);
        try {
            return subscriptionPlanRepository.save(plan);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save subscription plan: " + e.getMessage());
        }
    }

    public List<SubscriptionPlan> getAllSubscriptionPlans() {
        return subscriptionPlanRepository.findAll();
    }

    public SubscriptionPlan updateSubscriptionPlan(Long planId, String name, String description, double price) {
        if (planId == null) {
            throw new IllegalArgumentException("Plan ID cannot be null");
        }
        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId)
            .orElseThrow(() -> new IllegalArgumentException("Subscription plan not found with ID: " + planId));
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Plan name cannot be empty");
        }
        if (!plan.getName().equals(name) && subscriptionPlanRepository.existsByName(name)) {
            throw new IllegalArgumentException("Another plan with name '" + name + "' already exists");
        }
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("Description cannot be empty");
        }
        List<String> features = Arrays.stream(description.split("\\s*,\\s*"))
            .map(String::trim)
            .filter(f -> !f.isEmpty())
            .collect(Collectors.toList());
        if (features.isEmpty()) {
            throw new IllegalArgumentException("Description must contain at least one valid feature");
        }
        if (price < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
        plan.setName(name);
        plan.setFeatures(features);
        plan.setPrice(price);
        try {
            return subscriptionPlanRepository.save(plan);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update subscription plan: " + e.getMessage());
        }
    }

    public void deleteSubscriptionPlan(Long planId) {
        SubscriptionPlan plan = subscriptionPlanRepository.findById(planId)
            .orElseThrow(() -> new IllegalArgumentException("Subscription plan not found with ID: " + planId));
        List<Subscription> subs = subscriptionRepository.findByPlan(plan.getName());
        if (!subs.isEmpty()) {
            throw new IllegalArgumentException("Cannot delete plan with active subscriptions");
        }
        try {
            subscriptionPlanRepository.deleteById(planId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete subscription plan: " + e.getMessage());
        }
    }

    public Subscription updateSubscription(Long subscriptionId, String plan, boolean active) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
            .orElseThrow(() -> new IllegalArgumentException("Subscription not found: " + subscriptionId));
        
        subscriptionPlanRepository.findByName(plan)
            .orElseThrow(() -> new IllegalArgumentException("Subscription plan not found: " + plan));
        
        subscription.setPlan(plan);
        subscription.setActive(active);
        if (!active && subscription.getEndDate() == null) {
            subscription.setEndDate(LocalDateTime.now());
        } else if (active && subscription.getEndDate() != null) {
            subscription.setEndDate(null);
        }
        try {
            return subscriptionRepository.save(subscription);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update subscription: " + e.getMessage());
        }
    }

    public void deleteSubscription(Long subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
            .orElseThrow(() -> new IllegalArgumentException("Subscription not found: " + subscriptionId));
        try {
            subscriptionRepository.delete(subscription);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete subscription: " + e.getMessage());
        }
    }
}