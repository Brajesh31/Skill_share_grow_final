package com.skillsphere.backend.controller;

import com.skillsphere.backend.dto.PostDTO;
import com.skillsphere.backend.model.Post;
import com.skillsphere.backend.service.PostService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private static final Logger logger = LoggerFactory.getLogger(PostController.class);
    private static final String SECRET_KEY = "your-secret-key-with-at-least-32-characters";
    private static final String UPLOAD_DIR = "uploads/";

    @Autowired
    private PostService postService;
    //create post ewfef
    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "files", required = false) List<MultipartFile> files) {
        logger.info("Received create post request with title: {}", title);
        try {
            Long userId = getUserIdFromToken(authHeader);
            List<String> filePaths = handleFileUploads(files);
            List<String> tagList = tags != null && !tags.isEmpty() ? Arrays.asList(tags.split(",")) : new ArrayList<>();
            PostDTO post = postService.createPost(userId, title, content, category, tagList, filePaths);
            logger.info("Post created successfully with ID: {}", post.getId());
            return ResponseEntity.ok(post);
        } catch (IOException e) {
            logger.error("Error saving files: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving files: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error creating post: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts() {
        try {
            List<PostDTO> posts = postService.getAllPosts();
            logger.info("Fetched {} posts", posts.size());
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            logger.error("Error fetching posts: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPost(@PathVariable Long id) {
        try {
            PostDTO post = postService.getPost(id);
            logger.info("Fetched post with ID: {}", id);
            return ResponseEntity.ok(post);
        } catch (RuntimeException e) {
            logger.error("Post not found with ID: {}", id, e);
            return ResponseEntity.notFound().build();
        }
    }
    //update post  hfdgfeyg
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "files", required = false) List<MultipartFile> files) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            List<String> filePaths = handleFileUploads(files);
            Post post = new Post();
            post.setId(id);
            post.setTitle(title);
            post.setContent(content);
            post.setCategory(category);
            post.setTags(tags);
            post.setImages(filePaths != null && !filePaths.isEmpty() ? String.join(",", filePaths) : null);
            PostDTO updatedPost = postService.updatePost(userId, post);
            logger.info("Post ID: {} updated successfully", id);
            return ResponseEntity.ok(updatedPost);
        } catch (IOException e) {
            logger.error("Error updating files for post ID: {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating files: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error updating post ID: {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            postService.deletePost(id, userId);
            logger.info("Post ID: {} deleted successfully", id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("Error deleting post ID: {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<PostDTO> addComment(
            @PathVariable Long postId,
            @RequestBody CommentRequest commentRequest,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            PostDTO updatedPost = postService.addComment(postId, userId, commentRequest.getText());
            logger.info("Comment added to post ID: {}", postId);
            return ResponseEntity.ok(updatedPost);
        } catch (RuntimeException e) {
            logger.error("Error adding comment to post ID: {}: {}", postId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Unexpected error adding comment to post ID: {}: {}", postId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<PostDTO> updateComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @RequestBody CommentRequest commentRequest,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            PostDTO updatedPost = postService.updateComment(postId, commentId, userId, commentRequest.getText());
            logger.info("Comment ID: {} updated for post ID: {}", commentId, postId);
            return ResponseEntity.ok(updatedPost);
        } catch (RuntimeException e) {
            logger.error("Error updating comment ID: {} for post ID: {}: {}", commentId, postId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            logger.error("Unexpected error updating comment ID: {} for post ID: {}: {}", commentId, postId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{postId}/reactions")
    public ResponseEntity<PostDTO> addReaction(
            @PathVariable Long postId,
            @RequestBody ReactionRequest reactionRequest,
            @RequestHeader("Authorization") String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            PostDTO updatedPost = postService.addReaction(postId, userId, reactionRequest.getReactionType());
            logger.info("Reaction {} added to post ID: {} by user ID: {}", 
                    reactionRequest.getReactionType(), postId, userId);
            return ResponseEntity.ok(updatedPost);
        } catch (RuntimeException e) {
            logger.error("Error adding reaction to post ID: {}: {}", postId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Unexpected error adding reaction to post ID: {}: {}", postId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private Long getUserIdFromToken(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        try {
            String userId = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
            return Long.parseLong(userId);
        } catch (Exception e) {
            logger.error("Invalid JWT token: {}", e.getMessage(), e);
            throw new RuntimeException("Invalid token");
        }
    }

    private List<String> handleFileUploads(List<MultipartFile> files) throws IOException {
        List<String> filePaths = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
            String absoluteUploadDir = System.getProperty("user.dir") + "/" + UPLOAD_DIR;
            Path uploadDir = Paths.get(absoluteUploadDir);

            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
                logger.info("Created upload directory: {}", uploadDir.toAbsolutePath());
            }

            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String originalFilename = file.getOriginalFilename();
                    if (originalFilename == null) {
                        logger.warn("File has no original filename");
                        continue;
                    }
                    String sanitizedFilename = originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
                    String fileName = UUID.randomUUID() + "_" + sanitizedFilename;
                    Path filePath = uploadDir.resolve(fileName);
                    file.transferTo(filePath.toFile());
                    filePaths.add("/uploads/" + fileName);
                    logger.info("Successfully saved file: {}", filePath.toAbsolutePath());
                }
            }
        }
        return filePaths;
    }
}

class CommentRequest {
    private String text;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}

class ReactionRequest {
    private String reactionType;

    public String getReactionType() {
        return reactionType;
    }

    public void setReactionType(String reactionType) {
        this.reactionType = reactionType;
    }
}