package com.skillsphere.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "reactions")
@Data
public class Reaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "reaction_type", nullable = false)
    private String reactionType; // "LIKE", "LOVE"

    @Column(name = "created_at")
    private String createdAt;
}