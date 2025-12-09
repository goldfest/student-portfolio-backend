package com.portfolio.services;

import com.portfolio.dto.TeacherDTO;
import com.portfolio.dto.TeacherResponseDTO;
import com.portfolio.models.Role;
import com.portfolio.models.Teacher;
import com.portfolio.repositories.TeacherRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;

    public List<TeacherResponseDTO> getAllTeachers() {
        List<Teacher> teachers = teacherRepository.findAll();
        return teachers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TeacherResponseDTO getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Teacher not found with id: " + id));
        return convertToDTO(teacher);
    }

    public TeacherResponseDTO getTeacherByEmail(String email) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Teacher not found with email: " + email));
        return convertToDTO(teacher);
    }

    @Transactional
    public TeacherResponseDTO createTeacher(TeacherDTO teacherDTO) {
        if (teacherRepository.existsByEmail(teacherDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        Teacher teacher = convertDTOToEntity(teacherDTO);
        teacher.setRole(teacherDTO.getRole() != null ? teacherDTO.getRole() : Role.TEACHER);

        if (teacher.getPasswordHash() != null && !teacher.getPasswordHash().isEmpty()) {
            teacher.setPasswordHash(passwordEncoder.encode(teacher.getPasswordHash()));
        }

        Teacher saved = teacherRepository.save(teacher);
        return convertToDTO(saved);
    }

    @Transactional
    public TeacherResponseDTO updateTeacher(Long id, TeacherDTO teacherDTO) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Teacher not found with id: " + id));

        if (!teacher.getEmail().equals(teacherDTO.getEmail()) &&
                teacherRepository.existsByEmail(teacherDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        updateEntityFromDTO(teacher, teacherDTO);

        Teacher updated = teacherRepository.save(teacher);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteTeacher(Long id) {
        if (!teacherRepository.existsById(id)) {
            throw new EntityNotFoundException("Teacher not found with id: " + id);
        }
        teacherRepository.deleteById(id);
    }

    private TeacherResponseDTO convertToDTO(Teacher teacher) {
        return TeacherResponseDTO.builder()
                .id(teacher.getId())
                .idName(teacher.getIdName())
                .email(teacher.getEmail())
                .bio(teacher.getBio())
                .avatarUrl(teacher.getAvatarUrl())
                .isActive(teacher.getIsActive())
                .role(teacher.getRole())
                .createdAt(teacher.getCreatedAt())
                .build();
    }

    private Teacher convertDTOToEntity(TeacherDTO dto) {
        Teacher teacher = new Teacher();
        teacher.setIdName(dto.getIdName());
        teacher.setEmail(dto.getEmail());
        teacher.setPasswordHash(dto.getPassword());
        teacher.setBio(dto.getBio());
        teacher.setAvatarUrl(dto.getAvatarUrl());
        teacher.setIsActive(dto.getIsActive());
        teacher.setRole(dto.getRole());
        return teacher;
    }

    private void updateEntityFromDTO(Teacher entity, TeacherDTO dto) {
        entity.setIdName(dto.getIdName());
        entity.setEmail(dto.getEmail());
        entity.setBio(dto.getBio());
        entity.setAvatarUrl(dto.getAvatarUrl());
        entity.setIsActive(dto.getIsActive());

        if (dto.getRole() != null) {
            entity.setRole(dto.getRole());
        }

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            entity.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }
    }
}