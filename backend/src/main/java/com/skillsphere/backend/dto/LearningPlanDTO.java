package com.skillsphere.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LearningPlanDTO {
    private Long id;
    private String title;
    private String description;
    private Integer duration;
    private String thumbnailUrl; // New field
    private String status; // New field
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long userId;
    private String username;
}