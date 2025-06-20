package com.skillsphere.backend.repository;

import com.skillsphere.backend.model.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    Optional<Reaction> findByPostIdAndUserId(Long postId, Long userId);
    List<Reaction> findByPostId(Long postId);

    @Modifying
    @Query("DELETE FROM Reaction r WHERE r.post.id = :postId")
    void deleteByPostId(Long postId);
}