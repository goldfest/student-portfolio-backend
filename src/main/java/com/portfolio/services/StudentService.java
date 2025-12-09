package com.portfolio.services;

import com.portfolio.dto.StudentDTO;
import com.portfolio.dto.StudentResponseDTO;
import com.portfolio.models.Group;
import com.portfolio.models.Role;
import com.portfolio.models.Student;
import com.portfolio.repositories.GroupRepository;
import com.portfolio.repositories.StudentRepository;
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
public class StudentService {

    private final StudentRepository studentRepository;
    private final GroupRepository groupRepository;
    private final PasswordEncoder passwordEncoder;

    public List<StudentResponseDTO> getAllStudents() {
        List<Student> students = studentRepository.findAll();
        return students.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public StudentResponseDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + id));
        return convertToDTO(student);
    }

    public StudentResponseDTO getStudentByEmail(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Student not found with email: " + email));
        return convertToDTO(student);
    }

    @Transactional
    public StudentResponseDTO createStudent(StudentDTO studentDTO) {
        if (studentRepository.existsByEmail(studentDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (studentRepository.existsByIdName(studentDTO.getIdName())) {
            throw new IllegalArgumentException("ID Name already exists");
        }

        Student student = new Student();
        mapDtoToEntity(studentDTO, student);

        student.setRole(Role.STUDENT);

        if (studentDTO.getGroupId() != null) {
            Group group = groupRepository.findById(studentDTO.getGroupId())
                    .orElseThrow(() -> new EntityNotFoundException("Group not found"));
            student.setGroup(group);
        }

        Student saved = studentRepository.save(student);
        return convertToDTO(saved);
    }

    @Transactional
    public StudentResponseDTO updateStudent(Long id, StudentDTO studentDTO) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + id));

        if (!student.getEmail().equals(studentDTO.getEmail()) &&
                studentRepository.existsByEmail(studentDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        if (!student.getIdName().equals(studentDTO.getIdName()) &&
                studentRepository.existsByIdName(studentDTO.getIdName())) {
            throw new IllegalArgumentException("ID Name already exists");
        }

        mapDtoToEntity(studentDTO, student);

        if (studentDTO.getGroupId() != null) {
            Group group = groupRepository.findById(studentDTO.getGroupId())
                    .orElseThrow(() -> new EntityNotFoundException("Group not found"));
            student.setGroup(group);
        } else {
            student.setGroup(null);
        }

        Student updated = studentRepository.save(student);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new EntityNotFoundException("Student not found with id: " + id);
        }
        studentRepository.deleteById(id);
    }

    private StudentResponseDTO convertToDTO(Student student) {
        StudentResponseDTO.GroupSimpleDTO groupDTO = null;
        if (student.getGroup() != null) {
            groupDTO = StudentResponseDTO.GroupSimpleDTO.builder()
                    .id(student.getGroup().getId())
                    .name(student.getGroup().getName())
                    .code(student.getGroup().getCode())
                    .build();
        }

        return StudentResponseDTO.builder()
                .id(student.getId())
                .idName(student.getIdName())
                .email(student.getEmail())
                .bio(student.getBio())
                .avatarUrl(student.getAvatarUrl())
                .isActive(student.getIsActive())
                .role(student.getRole())
                .createdAt(student.getCreatedAt())
                .group(groupDTO)
                .build();
    }

    private void mapDtoToEntity(StudentDTO dto, Student entity) {
        entity.setIdName(dto.getIdName());
        entity.setEmail(dto.getEmail());
        entity.setBio(dto.getBio());
        entity.setAvatarUrl(dto.getAvatarUrl());
        entity.setIsActive(dto.getIsActive());

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            entity.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }
    }
}