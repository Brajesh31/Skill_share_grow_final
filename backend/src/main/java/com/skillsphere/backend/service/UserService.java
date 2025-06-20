package com.skillsphere.backend.service;

import com.skillsphere.backend.model.User;
import com.skillsphere.backend.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.ArrayList;

@Service
public class UserService implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecretKey secretKey;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, SecretKey secretKey) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.secretKey = secretKey;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("Loading user by username: {}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.error("User not found: {}", username);
                    return new UsernameNotFoundException("User not found: " + username);
                });
        logger.debug("User found: {}, isAdmin: {}", username, user.isAdmin());
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .roles(user.isAdmin() ? "ADMIN" : "USER")
                .build();
    }

    public User findById(Long userId) {
        logger.info("Fetching user by id: {}", userId);
        return userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with id: {}", userId);
                    return new RuntimeException("User not found with id: " + userId);
                });
    }

    public User register(String username, String password) {
        logger.info("Registering user: {}", username);
        if (userRepository.findByUsername(username).isPresent()) {
            logger.error("Username already exists: {}", username);
            throw new RuntimeException("Username already exists");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setCreatedAt(java.time.LocalDateTime.now().toString());
        user.setAdmin(false);
        User savedUser = userRepository.save(user);
        logger.info("User registered successfully with id: {}", savedUser.getId());
        return savedUser;
    }

    public User authenticate(String username, String password) {
        logger.info("Authenticating user: {}", username);
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            logger.warn("User not found: {}", username);
            return null;
        }
        if (passwordEncoder.matches(password, user.getPassword())) {
            logger.info("User authenticated successfully: {}", username);
            return user;
        }
        logger.warn("Password mismatch for user: {}", username);
        return null;
    }

    public void followUser(User follower, User followed) {
        if (!followed.getFollowers().contains(follower)) {
            followed.getFollowers().add(follower);
            userRepository.save(followed);
            logger.info("User {} now follows user {}", follower.getId(), followed.getId());
        }
    }

    public void unfollowUser(User follower, User followed) {
        followed.getFollowers().remove(follower);
        userRepository.save(followed);
        logger.info("User {} unfollowed user {}", follower.getId(), followed.getId());
    }

    public User getUserFromToken(String token) {
        String userId = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
        return findById(Long.parseLong(userId));
    }
}