package com.portfolio.controllers;

import com.portfolio.dto.AuthRequest;
import com.portfolio.dto.AuthResponse;
import com.portfolio.models.Role;
import com.portfolio.models.Student;
import com.portfolio.models.Teacher;
import com.portfolio.models.User;
import com.portfolio.repositories.StudentRepository;
import com.portfolio.repositories.TeacherRepository;
import com.portfolio.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest authRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getEmail(),
                            authRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtTokenProvider.generateToken(authentication);

            User user = getUserByEmail(authRequest.getEmail());

            AuthResponse response = new AuthResponse(
                    jwt,
                    user.getEmail(),
                    user.getRole(),
                    user.getIdName(),
                    user.getId()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }
    }

    @PostMapping("/register/student")
    public ResponseEntity<?> registerStudent(@Valid @RequestBody com.portfolio.dto.StudentDTO studentDTO) {
        try {
            if (studentRepository.existsByEmail(studentDTO.getEmail())) {
                return ResponseEntity.badRequest().body("Email already exists");
            }
            if (studentRepository.existsByIdName(studentDTO.getIdName())) {
                return ResponseEntity.badRequest().body("ID Name already exists");
            }

            Student student = new Student();
            student.setIdName(studentDTO.getIdName());
            student.setEmail(studentDTO.getEmail());
            student.setPasswordHash(passwordEncoder.encode(studentDTO.getPassword()));
            student.setBio(studentDTO.getBio());
            student.setAvatarUrl(studentDTO.getAvatarUrl());
            student.setIsActive(studentDTO.getIsActive());
            student.setRole(Role.STUDENT);

            Student savedStudent = studentRepository.save(student);

            // Автоматический логин после регистрации
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            studentDTO.getEmail(),
                            studentDTO.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtTokenProvider.generateToken(authentication);

            AuthResponse response = new AuthResponse(
                    jwt,
                    savedStudent.getEmail(),
                    savedStudent.getRole(),
                    savedStudent.getIdName(),
                    savedStudent.getId()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // JWT is stateless, so logout is handled on client side by removing token
        return ResponseEntity.ok().build();
    }

    private User getUserByEmail(String email) {
        return studentRepository.findByEmail(email)
                .map(user -> (User) user)
                .orElseGet(() -> teacherRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("User not found")));
    }
}