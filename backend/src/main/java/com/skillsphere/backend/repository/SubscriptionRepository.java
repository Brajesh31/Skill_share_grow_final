// SubscriptionRepository.java
package com.skillsphere.backend.repository;

import com.skillsphere.backend.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByUserId(Long userId);
    List<Subscription> findByUserIdAndActive(Long userId, boolean active);
    List<Subscription> findByPlan(String plan);
}