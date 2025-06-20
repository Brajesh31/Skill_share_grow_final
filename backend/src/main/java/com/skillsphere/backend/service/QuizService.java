package com.skillsphere.backend.service;

import com.skillsphere.backend.model.Quiz;
import com.skillsphere.backend.model.Question;
import com.skillsphere.backend.model.User;
import com.skillsphere.backend.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private UserService userService;

    public Quiz createQuiz(Long userId, String title, List<Question> questions) {
        User user = userService.findById(userId);
        if (user == null) throw new RuntimeException("User not found");
        Quiz quiz = new Quiz();
        quiz.setTitle(title);
        quiz.setUser(user); // Requires setUser in Quiz
        questions.forEach(q -> q.setQuiz(quiz));
        quiz.setQuestions(questions);
        return quizRepository.save(quiz);
    }

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }
}