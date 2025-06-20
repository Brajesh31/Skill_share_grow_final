package com.skillsphere.backend.service;

import com.skillsphere.backend.dto.LearningPlanDTO;
import com.skillsphere.backend.model.LearningPlan;
import com.skillsphere.backend.model.User;
import com.skillsphere.backend.repository.LearningPlanRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class LearningPlanService {

    private static final Logger logger = LoggerFactory.getLogger(LearningPlanService.class);
    private static final Pattern IMAGE_URL_PATTERN = Pattern.compile(
        "^https?://.*\\.(jpg|jpeg|png|gif|bmp|webp)$", Pattern.CASE_INSENSITIVE
    );

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    @Autowired
    private UserService userService;

    private void validateThumbnailUrl(String url) {
        if (url == null || url.isEmpty()) {
            return;
        }
        if (url.length() > 512) {
            throw new IllegalArgumentException("Thumbnail URL is too long (max 512 characters)");
        }
        if (!IMAGE_URL_PATTERN.matcher(url).matches()) {
            throw new IllegalArgumentException("Invalid thumbnail URL: must be a valid image URL (e.g., ending with .jpg, .png)");
        }
    }

    public LearningPlanDTO createLearningPlan(LearningPlanDTO dto, String token) {
        logger.info("Creating learning plan: {}", dto.getTitle());
        User user = userService.getUserFromToken(token);

        LearningPlan plan = new LearningPlan();
        plan.setTitle(dto.getTitle());
        plan.setDescription(dto.getDescription());
        plan.setDuration(dto.getDuration());

        validateThumbnailUrl(dto.getThumbnailUrl());
        plan.setThumbnailUrl(dto.getThumbnailUrl());

        plan.setStatus(dto.getStatus() != null ? dto.getStatus() : "NOT_STARTED");
        plan.setUser(user);
        plan.setCreatedAt(LocalDateTime.now());
        plan.setUpdatedAt(LocalDateTime.now());

        LearningPlan savedPlan = learningPlanRepository.save(plan);
        logger.info("Saved learning plan with ID: {}", savedPlan.getId());
        return convertToDTO(savedPlan);
    }

    public List<LearningPlanDTO> getLearningPlans(String token) {
        User user = userService.getUserFromToken(token);
        List<LearningPlan> plans = learningPlanRepository.findByUser(user);
        logger.info("Fetched {} learning plans for user ID: {}", plans.size(), user.getId());
        return plans.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<LearningPlanDTO> getAllLearningPlans(String status) {
        List<LearningPlan> plans;
        if (status != null && !status.isEmpty()) {
            logger.info("Fetching learning plans with status: {}", status);
            plans = learningPlanRepository.findByStatus(status);
        } else {
            logger.info("Fetching all learning plans");
            plans = learningPlanRepository.findAll();
        }
        logger.info("Fetched {} learning plans", plans.size());
        return plans.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public LearningPlanDTO updateLearningPlan(Long id, LearningPlanDTO dto, String token) {
        User user = userService.getUserFromToken(token);
        LearningPlan plan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Learning plan not found"));

        if (!plan.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized to update this learning plan");
        }

        plan.setTitle(dto.getTitle());
        plan.setDescription(dto.getDescription());
        plan.setDuration(dto.getDuration());

        validateThumbnailUrl(dto.getThumbnailUrl());
        plan.setThumbnailUrl(dto.getThumbnailUrl());

        plan.setStatus(dto.getStatus());
        plan.setUpdatedAt(LocalDateTime.now());

        LearningPlan updatedPlan = learningPlanRepository.save(plan);
        logger.info("Updated learning plan with ID: {}", id);
        return convertToDTO(updatedPlan);
    }

    public LearningPlanDTO updateLearningPlanStatus(Long id, String status, String token) {
        User user = userService.getUserFromToken(token);
        LearningPlan plan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Learning plan not found"));

        if (!plan.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized to update this learning plan");
        }

        plan.setStatus(status);
        plan.setUpdatedAt(LocalDateTime.now());

        LearningPlan updatedPlan = learningPlanRepository.save(plan);
        logger.info("Updated status of learning plan ID {} to: {}", id, status);
        return convertToDTO(updatedPlan);
    }

    public void deleteLearningPlan(Long id, String token) {
        User user = userService.getUserFromToken(token);
        LearningPlan plan = learningPlanRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Learning plan not found"));

        if (!plan.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized to delete this learning plan");
        }

        learningPlanRepository.delete(plan);
        logger.info("Deleted learning plan with ID: {}", id);
    }

    private LearningPlanDTO convertToDTO(LearningPlan plan) {
        LearningPlanDTO dto = new LearningPlanDTO();
        dto.setId(plan.getId());
        dto.setTitle(plan.getTitle());
        dto.setDescription(plan.getDescription());
        dto.setDuration(plan.getDuration());
        dto.setThumbnailUrl(plan.getThumbnailUrl());
        dto.setStatus(plan.getStatus());
        dto.setCreatedAt(plan.getCreatedAt());
        dto.setUpdatedAt(plan.getUpdatedAt());
        dto.setUserId(plan.getUser().getId());
        return dto;
    }
}