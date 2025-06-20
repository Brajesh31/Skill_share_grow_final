package com.skillsphere.backend.repository;

import com.skillsphere.backend.model.PostFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostFileRepository extends JpaRepository<PostFile, Long> {
}