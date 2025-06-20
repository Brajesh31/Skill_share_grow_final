package com.skillsphere.backend.service;

import com.skillsphere.backend.model.Admin;
import com.skillsphere.backend.repository.AdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Admin authenticate(String username, String password) {
        logger.info("Authenticating admin: {}", username);
        Admin admin = adminRepository.findByUsername(username).orElse(null);
        if (admin == null) {
            logger.warn("Admin not found: {}", username);
            return null;
        }
        if (passwordEncoder.matches(password, admin.getPassword())) {
            logger.info("Admin authenticated successfully: {}", username);
            return admin;
        }
        logger.warn("Password mismatch for admin: {}", username);
        return null;
    }

    public Admin findById(Long adminId) {
        logger.info("Fetching admin by id: {}", adminId);
        return adminRepository.findById(adminId)
                .orElseThrow(() -> {
                    logger.error("Admin not found with id: {}", adminId);
                    return new RuntimeException("Admin not found with id: " + adminId);
                });
    }
}