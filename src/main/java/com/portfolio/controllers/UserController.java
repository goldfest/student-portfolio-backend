package com.portfolio.controllers;

import com.portfolio.models.Role;
import com.portfolio.models.Student;
import com.portfolio.models.Teacher;
import com.portfolio.repositories.StudentRepository;
import com.portfolio.repositories.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        String email = userDetails.getUsername();

        // Проверяем, является ли пользователь студентом
        Student student = studentRepository.findByEmail(email).orElse(null);
        if (student != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("id", student.getId());
            response.put("idName", student.getIdName());
            response.put("email", student.getEmail());
            response.put("role", Role.STUDENT);
            response.put("bio", student.getBio());
            response.put("avatarUrl", student.getAvatarUrl());
            response.put("isActive", student.getIsActive());
            response.put("groupId", student.getGroup() != null ? student.getGroup().getId() : null);
            return ResponseEntity.ok(response);
        }

        // Проверяем, является ли пользователь преподавателем
        Teacher teacher = teacherRepository.findByEmail(email).orElse(null);
        if (teacher != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("id", teacher.getId());
            response.put("idName", teacher.getIdName());
            response.put("email", teacher.getEmail());
            response.put("role", Role.TEACHER);
            response.put("bio", teacher.getBio());
            response.put("avatarUrl", teacher.getAvatarUrl());
            response.put("isActive", teacher.getIsActive());
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(404).body("User not found");
    }
}