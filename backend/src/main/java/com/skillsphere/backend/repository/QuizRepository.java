package com.skillsphere.backend.repository;

import com.skillsphere.backend.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
}