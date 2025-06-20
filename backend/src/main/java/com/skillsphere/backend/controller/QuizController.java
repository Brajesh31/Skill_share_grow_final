package com.skillsphere.backend.controller;

import com.skillsphere.backend.model.Question;
import com.skillsphere.backend.model.Quiz;
import com.skillsphere.backend.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@RequestBody QuizRequest request, @RequestParam Long userId) {
        Quiz quiz = quizService.createQuiz(userId, request.getTitle(), request.getQuestions());
        return ResponseEntity.ok(quiz);
    }

    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }
}

class QuizRequest {
    private String title;
    private List<Question> questions;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }
}