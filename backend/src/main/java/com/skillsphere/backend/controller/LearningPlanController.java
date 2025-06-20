package com.skillsphere.backend.controller;

import com.skillsphere.backend.dto.LearningPlanDTO;
import com.skillsphere.backend.service.LearningPlanService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/learning-plans")
public class LearningPlanController {

    private static final Logger logger = LoggerFactory.getLogger(LearningPlanController.class);

    @Autowired
    private LearningPlanService learningPlanService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createLearningPlan(
            @RequestBody LearningPlanDTO dto,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (dto.getTitle() == null || dto.getTitle().isEmpty()) {
                logger.error("Title is required");
                return ResponseEntity.status(400).body(Map.of("message", "Title is required"));
            }
            String token = authHeader.replace("Bearer ", "");
            LearningPlanDTO createdPlan = learningPlanService.createLearningPlan(dto, token);
            logger.info("Created learning plan: {}", createdPlan.getId());
            return ResponseEntity.ok(Map.of("learningPlan", createdPlan));
        } catch (IllegalArgumentException e) {
            logger.error("Validation error: {}", e.getMessage());
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to create learning plan: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<LearningPlanDTO>> getLearningPlans(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            List<LearningPlanDTO> plans = learningPlanService.getLearningPlans(token);
            logger.info("Fetched {} learning plans for user", plans.size());
            return ResponseEntity.ok(plans);
        } catch (Exception e) {
            logger.error("Failed to fetch learning plans: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<LearningPlanDTO>> getAllLearningPlans(
            @RequestParam(value = "status", required = false) String status) {
        try {
            List<LearningPlanDTO> plans = learningPlanService.getAllLearningPlans(status);
            logger.info("Fetched {} learning plans with status: {}", plans.size(), status != null ? status : "all");
            return ResponseEntity.ok(plans);
        } catch (Exception e) {
            logger.error("Failed to fetch all learning plans: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningPlanDTO> updateLearningPlan(
            @PathVariable Long id,
            @RequestBody LearningPlanDTO dto,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            LearningPlanDTO updatedPlan = learningPlanService.updateLearningPlan(id, dto, token);
            logger.info("Updated learning plan: {}", id);
            return ResponseEntity.ok(updatedPlan);
        } catch (Exception e) {
            logger.error("Failed to update learning plan: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<LearningPlanDTO> updateLearningPlanStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String status = body.get("status");
            String token = authHeader.replace("Bearer ", "");
            LearningPlanDTO updatedPlan = learningPlanService.updateLearningPlanStatus(id, status, token);
            logger.info("Updated status for learning plan: {}", id);
            return ResponseEntity.ok(updatedPlan);
        } catch (Exception e) {
            logger.error("Failed to update learning plan status: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLearningPlan(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            learningPlanService.deleteLearningPlan(id, token);
            logger.info("Deleted learning plan: {}", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Failed to delete learning plan: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }
}