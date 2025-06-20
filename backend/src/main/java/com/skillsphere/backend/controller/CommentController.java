package com.skillsphere.backend.controller;

import com.skillsphere.backend.service.CommentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
public class CommentController {
    private static final Logger logger = LoggerFactory.getLogger(CommentController.class);

    @Autowired
    private CommentService commentService;

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        logger.info("Deleting comment ID: {}", commentId);
        try {
            Long userId = getUserIdFromSecurityContext();
            logger.info("Extracted userId from SecurityContext: {}", userId);
            commentService.deleteComment(commentId, userId);
            logger.info("Comment ID: {} deleted successfully", commentId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("Error deleting comment ID {}: {}", commentId, e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            logger.error("Unexpected error deleting comment ID {}: {}", commentId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private Long getUserIdFromSecurityContext() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String userId = ((UserDetails) principal).getUsername(); // Username is userId in our case
            return Long.parseLong(userId);
        } else {
            logger.error("Principal is not a UserDetails: {}", principal);
            throw new RuntimeException("User not authenticated");
        }
    }
}