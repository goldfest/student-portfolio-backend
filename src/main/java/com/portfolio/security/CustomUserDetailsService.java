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
        // 1. СНАЧАЛА ищем преподавателя (включая администраторов)
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElse(null);

        if (teacher != null) {
            // Важно: роль должна быть с префиксом "ROLE_"
            return createUserDetails(
                    teacher.getEmail(),
                    teacher.getPasswordHash(),
                    "ROLE_" + teacher.getRole().name() // Вернет "ROLE_ADMIN" или "ROLE_TEACHER"
            );
        }

        // 2. Если преподаватель не найден, ищем студента
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return createUserDetails(
                student.getEmail(),
                student.getPasswordHash(),
                "ROLE_" + student.getRole().name() // Вернет "ROLE_STUDENT"
        );
    }

    private UserDetails createUserDetails(String email, String password, String authority) {
        // Используем переданный authority с уже готовым префиксом
        return new org.springframework.security.core.userdetails.User(
                email,
                password,
                Collections.singletonList(new SimpleGrantedAuthority(authority))
        );
    }
}