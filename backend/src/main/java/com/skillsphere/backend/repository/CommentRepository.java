package com.skillsphere.backend.repository;

import com.skillsphere.backend.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    void deleteByPostId(Long postId);
}