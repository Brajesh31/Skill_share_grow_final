package com.skillsphere.backend.service;

import com.skillsphere.backend.dto.CommentDTO;
import com.skillsphere.backend.dto.PostDTO;
import com.skillsphere.backend.dto.UserDTO;
import com.skillsphere.backend.model.Comment;
import com.skillsphere.backend.model.Post;
import com.skillsphere.backend.model.Reaction;
import com.skillsphere.backend.model.User;
import com.skillsphere.backend.repository.CommentRepository;
import com.skillsphere.backend.repository.PostRepository;
import com.skillsphere.backend.repository.ReactionRepository;
import com.skillsphere.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReactionRepository reactionRepository;

    @Transactional
    public PostDTO createPost(Long userId, String title, String content, String category, List<String> tags, List<String> filePaths) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = new Post();
        post.setUser(user);
        post.setTitle(title);
        post.setContent(content);
        post.setCategory(category);
        post.setTags(tags != null ? String.join(",", tags) : null);
        post.setImages(filePaths != null ? String.join(",", filePaths) : null);
        post.setLikes(0);
        post.setCreatedAt(java.time.LocalDateTime.now().toString());
        return convertToDTO(postRepository.save(post));
    }

    @Transactional(readOnly = true)
    public List<PostDTO> getAllPosts() {
        return postRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PostDTO getPost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with ID: " + id));
        return convertToDTO(post);
    }

    @Transactional
    public PostDTO updatePost(Long userId, Post post) {
        Post existingPost = postRepository.findById(post.getId())
                .orElseThrow(() -> new RuntimeException("Post not found"));
        if (!existingPost.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        existingPost.setTitle(post.getTitle());
        existingPost.setContent(post.getContent());
        existingPost.setCategory(post.getCategory());
        existingPost.setTags(post.getTags());
        existingPost.setImages(post.getImages());
        return convertToDTO(postRepository.save(existingPost));
    }

    @Transactional
    public void deletePost(Long id, Long userId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        commentRepository.deleteByPostId(id);
        reactionRepository.deleteByPostId(id); // Use the custom method
        postRepository.deleteById(id);
    }

    @Transactional
    public PostDTO addComment(Long postId, Long userId, String text) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Comment comment = new Comment(text, post, user);
        commentRepository.save(comment);
        return convertToDTO(postRepository.findById(postId).get());
    }

    @Transactional
    public PostDTO updateComment(Long postId, Long commentId, Long userId, String text) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        comment.setText(text);
        commentRepository.save(comment);
        return convertToDTO(post);
    }

    @Transactional
    public PostDTO addReaction(Long postId, Long userId, String reactionType) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Reaction> existingReaction = reactionRepository.findByPostIdAndUserId(postId, userId);
        if (existingReaction.isPresent()) {
            Reaction reaction = existingReaction.get();
            if (reaction.getReactionType().equals(reactionType)) {
                reactionRepository.delete(reaction); // Remove reaction if same type is clicked again
            } else {
                reaction.setReactionType(reactionType);
                reactionRepository.save(reaction); // Update to new reaction type
            }
        } else {
            Reaction reaction = new Reaction();
            reaction.setPost(post);
            reaction.setUser(user);
            reaction.setReactionType(reactionType);
            reaction.setCreatedAt(java.time.LocalDateTime.now().toString());
            reactionRepository.save(reaction);
        }
        return convertToDTO(postRepository.findById(postId).get());
    }

    private PostDTO convertToDTO(Post post) {
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setCategory(post.getCategory());
        dto.setTags(post.getTags());
        dto.setImages(post.getImages());
        dto.setLikes(post.getLikes());
        dto.setCreatedAt(post.getCreatedAt());

        UserDTO userDTO = new UserDTO();
        userDTO.setId(post.getUser().getId());
        userDTO.setUsername(post.getUser().getUsername());
        dto.setUser(userDTO);

        dto.setComments(post.getComments().stream()
                .map(this::convertToCommentDTO)
                .collect(Collectors.toList()));

        dto.setReactions(post.getReactions().stream()
                .map(this::convertToReactionDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    private CommentDTO convertToCommentDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setText(comment.getText());
        dto.setCreatedAt(comment.getCreatedAt());

        UserDTO userDTO = new UserDTO();
        userDTO.setId(comment.getUser().getId());
        userDTO.setUsername(comment.getUser().getUsername());
        dto.setUser(userDTO);
        return dto;
    }

    private PostDTO.ReactionDTO convertToReactionDTO(Reaction reaction) {
        PostDTO.ReactionDTO dto = new PostDTO.ReactionDTO();
        dto.setId(reaction.getId());
        dto.setUserId(reaction.getUser().getId());
        dto.setUsername(reaction.getUser().getUsername());
        dto.setReactionType(reaction.getReactionType());
        dto.setCreatedAt(reaction.getCreatedAt());
        return dto;
    }
}