package com.skillsphere.backend.controller;

import com.skillsphere.backend.model.Activity;
import com.skillsphere.backend.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timeline")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Activity>> getUserTimeline(@PathVariable Long userId) {
        return ResponseEntity.ok(activityService.getUserTimeline(userId));
    }
}