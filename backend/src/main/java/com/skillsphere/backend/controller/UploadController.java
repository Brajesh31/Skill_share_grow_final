package com.skillsphere.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private static final Logger logger = LoggerFactory.getLogger(UploadController.class);

    private static final String[] ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"};
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String UPLOAD_DIR = "Uploads"; // Define locally to avoid injection issues

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Validate file
            if (file == null || file.isEmpty()) {
                logger.error("No file uploaded or file is empty");
                return ResponseEntity.status(400).body(Map.of("message", "No file uploaded or file is empty"));
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                logger.error("Filename is null or empty");
                return ResponseEntity.status(400).body(Map.of("message", "Invalid filename"));
            }

            if (!isValidExtension(originalFilename)) {
                logger.error("Invalid file extension: {}", originalFilename);
                return ResponseEntity.status(400).body(Map.of("message", "Invalid file extension. Allowed: jpg, jpeg, png, gif, webp"));
            }

            if (file.getSize() > MAX_FILE_SIZE) {
                logger.error("File too large: {} bytes", file.getSize());
                return ResponseEntity.status(400).body(Map.of("message", "File size exceeds 5MB limit"));
            }

            // Define upload path
            Path uploadPath = Paths.get(System.getProperty("user.dir"), UPLOAD_DIR).normalize();
            logger.debug("Upload path: {}", uploadPath);

            // Create uploads directory if it doesn't exist
            try {
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                    logger.info("Created upload directory: {}", uploadPath);
                }
                // Verify directory is writable
                if (!Files.isWritable(uploadPath)) {
                    logger.error("Upload directory is not writable: {}", uploadPath);
                    return ResponseEntity.status(500).body(Map.of("message", "Server error: Upload directory is not writable"));
                }
            } catch (IOException e) {
                logger.error("Failed to create upload directory {}: {}", uploadPath, e.getMessage(), e);
                return ResponseEntity.status(500).body(Map.of("message", "Server error: Failed to create upload directory"));
            }

            // Generate unique filename
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(newFilename).normalize();
            logger.debug("File path: {}", filePath);

            // Save file
            try {
                Files.write(filePath, file.getBytes()); // Fixed: Swapped arguments
                logger.info("File saved successfully: {}", filePath);
            } catch (IOException e) {
                logger.error("Failed to save file to {}: {}", filePath, e.getMessage(), e);
                return ResponseEntity.status(500).body(Map.of("message", "Server error: Failed to save file"));
            }

            // Construct URL
            String fileUrl = "http://localhost:8080/uploads/" + newFilename;
            logger.info("Uploaded file accessible at: {}", fileUrl);

            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Unexpected error during file upload: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of("message", "Internal server error: " + e.getMessage()));
        }
    }

    private boolean isValidExtension(String filename) {
        return Arrays.stream(ALLOWED_EXTENSIONS)
                .anyMatch(ext -> filename.toLowerCase().endsWith(ext));
    }
}