// SubscriptionPlanRepository.java
package com.skillsphere.backend.repository;

import com.skillsphere.backend.model.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    boolean existsByName(String name);
    Optional<SubscriptionPlan> findByName(String name); // Explicitly define this method
}