package com.skillsphere.backend.service;

import com.skillsphere.backend.model.Activity;
import com.skillsphere.backend.model.User;
import com.skillsphere.backend.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private UserService userService;

    public void logActivity(Long userId, String type, String description) {
        User user = userService.findById(userId);
        if (user == null) return;
        Activity activity = new Activity();
        activity.setUser(user);
        activity.setType(type);
        activity.setDescription(description);
        activityRepository.save(activity);
    }

    public List<Activity> getUserTimeline(Long userId) {
        return activityRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}