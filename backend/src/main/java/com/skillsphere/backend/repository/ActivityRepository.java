package com.skillsphere.backend.repository;

import com.skillsphere.backend.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByUserIdOrderByCreatedAtDesc(Long userId);
}