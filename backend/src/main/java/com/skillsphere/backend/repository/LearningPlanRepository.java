package com.skillsphere.backend.repository;

import com.skillsphere.backend.model.LearningPlan;
import com.skillsphere.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningPlanRepository extends JpaRepository<LearningPlan, Long> {
    List<LearningPlan> findByUser(User user);
    List<LearningPlan> findByStatus(String status); // Fetch plans by status
}