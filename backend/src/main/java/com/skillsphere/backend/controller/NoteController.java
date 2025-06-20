package com.skillsphere.backend.controller;

import com.skillsphere.backend.model.Note;
import com.skillsphere.backend.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteService noteService;

    @PostMapping
    public ResponseEntity<Note> createNote(@RequestBody NoteRequest request, @RequestParam Long userId) {
        Note note = noteService.createNote(userId, request.getTitle(), request.getContent());
        return ResponseEntity.ok(note);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Note>> getUserNotes(@PathVariable Long userId) {
        return ResponseEntity.ok(noteService.getUserNotes(userId));
    }

    @PutMapping("/{noteId}")
    public ResponseEntity<Note> updateNote(@PathVariable Long noteId, @RequestBody NoteRequest request, @RequestParam Long userId) {
        Note note = noteService.updateNote(noteId, request.getTitle(), request.getContent(), userId);
        return ResponseEntity.ok(note);
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long noteId, @RequestParam Long userId) {
        noteService.deleteNote(noteId, userId);
        return ResponseEntity.noContent().build();
    }
}

class NoteRequest {
    private String title;
    private String content;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}