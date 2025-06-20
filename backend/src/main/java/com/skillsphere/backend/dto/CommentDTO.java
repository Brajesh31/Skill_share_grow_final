package com.skillsphere.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentDTO {
    private Long id;
    private String text;
    private LocalDateTime createdAt;
    private UserDTO user;
}