package com.skillsphere.backend.service;

import com.skillsphere.backend.model.Comment;
import com.skillsphere.backend.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CommentService {
    @Autowired
    private CommentRepository commentRepository;

    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        commentRepository.delete(comment);
    }
}