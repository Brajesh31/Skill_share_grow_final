package com.skillsphere.backend.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class PostDTO {
    private Long id;
    private String title;
    private String content;
    private String category;
    private String tags;
    private String images;
    private Integer likes;
    private String createdAt;
    private UserDTO user;
    private List<CommentDTO> comments = new ArrayList<>();
    private List<ReactionDTO> reactions = new ArrayList<>();

    @Data
    public static class ReactionDTO {
        private Long id;
        private Long userId;
        private String username;
        private String reactionType;
        private String createdAt;
    }
}//ewfiowejfiwe;fhw