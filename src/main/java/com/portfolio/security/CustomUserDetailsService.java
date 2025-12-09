package com.portfolio.security;

import com.portfolio.models.Student;
import com.portfolio.models.Teacher;
import com.portfolio.repositories.StudentRepository;
import com.portfolio.repositories.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Сначала ищем студента
        Student student = studentRepository.findByEmail(email)
                .orElse(null);

        if (student != null) {
            return createUserDetails(student.getEmail(), student.getPasswordHash(), student.getRole().name());
        }

        // Если студент не найден, ищем преподавателя
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return createUserDetails(teacher.getEmail(), teacher.getPasswordHash(), teacher.getRole().name());
    }

    private UserDetails createUserDetails(String email, String password, String role) {
        return new org.springframework.security.core.userdetails.User(
                email,
                password,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
        );
    }
}