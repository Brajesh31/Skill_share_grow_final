package com.skillsphere.backend.repository;

import com.skillsphere.backend.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserId(Long userId); // Matches @JoinColumn(name = "user_id")
}