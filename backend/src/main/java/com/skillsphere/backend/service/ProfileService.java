package com.skillsphere.backend.service;

import com.skillsphere.backend.model.Post;
import com.skillsphere.backend.model.User;
import com.skillsphere.backend.repository.PostRepository;
import com.skillsphere.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    public User getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPosts(postRepository.findByUserId(userId));
        return user;
    }

    public List<Post> getUserPosts(Long userId) {
        return postRepository.findByUserId(userId);
    }
}