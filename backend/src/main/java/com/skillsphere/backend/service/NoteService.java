package com.skillsphere.backend.service;

import com.skillsphere.backend.model.Note;
import com.skillsphere.backend.model.User;
import com.skillsphere.backend.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private UserService userService;

    public Note createNote(Long userId, String title, String content) {
        User user = userService.findById(userId);
        if (user == null) throw new RuntimeException("User not found");
        Note note = new Note(title, content, user);
        return noteRepository.save(note);
    }

    public List<Note> getUserNotes(Long userId) {
        return noteRepository.findByUserId(userId);
    }

    public Note updateNote(Long noteId, String title, String content, Long userId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        if (!note.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        note.setTitle(title);
        note.setContent(content);
        return noteRepository.save(note);
    }

    public void deleteNote(Long noteId, Long userId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));
        if (!note.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        noteRepository.delete(note);
    }
}