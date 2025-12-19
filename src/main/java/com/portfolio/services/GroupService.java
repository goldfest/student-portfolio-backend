package com.portfolio.services;

import com.portfolio.dto.GroupResponseDTO;
import com.portfolio.models.Group;
import com.portfolio.models.Teacher;
import com.portfolio.repositories.GroupRepository;
import com.portfolio.repositories.TeacherRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GroupService {

    private final GroupRepository groupRepository;
    private final TeacherRepository teacherRepository;

    public List<GroupResponseDTO> getAllGroups() {
        List<Group> groups = groupRepository.findAll();
        return groups.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GroupResponseDTO getGroupById(Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + id));
        return convertToDTO(group);
    }

    public GroupResponseDTO getGroupByCode(String code) {
        Group group = groupRepository.findByCode(code)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with code: " + code));
        return convertToDTO(group);
    }

    public List<GroupResponseDTO> getGroupsByTeacherId(Long teacherId) {
        List<Group> groups = groupRepository.findByTeacherId(teacherId);
        return groups.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public GroupResponseDTO createGroup(Group group) {
        if (group.getCode() == null || group.getCode().isEmpty()) {
            group.setCode(generateGroupCode());
        }

        if (group.getTeacher() != null && group.getTeacher().getId() != null) {
            Teacher teacher = teacherRepository.findById(group.getTeacher().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Teacher not found"));
            group.setTeacher(teacher);
        }

        Group saved = groupRepository.save(group);
        return convertToDTO(saved);
    }

    @Transactional
    public GroupResponseDTO updateGroup(Long id, Group groupDetails) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + id));

        group.setName(groupDetails.getName());

        // ВАЖНО: Проверьте как работает этот код
        if (groupDetails.getTeacher() != null && groupDetails.getTeacher().getId() != null) {
            Teacher teacher = teacherRepository.findById(groupDetails.getTeacher().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Teacher not found"));
            group.setTeacher(teacher);
        } else {
            group.setTeacher(null); // Удаляем преподавателя если teacher = null
        }

        Group updated = groupRepository.save(group);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteGroup(Long id) {
        if (!groupRepository.existsById(id)) {
            throw new EntityNotFoundException("Group not found with id: " + id);
        }
        groupRepository.deleteById(id);
    }

    @Transactional
    public String regenerateGroupCode(Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + id));
        String newCode = generateGroupCode();
        group.setCode(newCode);
        groupRepository.save(group);
        return newCode;
    }

    private GroupResponseDTO convertToDTO(Group group) {
        GroupResponseDTO.TeacherSimpleDTO teacherDTO = null;
        if (group.getTeacher() != null) {
            teacherDTO = GroupResponseDTO.TeacherSimpleDTO.builder()
                    .id(group.getTeacher().getId())
                    .idName(group.getTeacher().getIdName())
                    .email(group.getTeacher().getEmail())
                    .build();
        }

        return GroupResponseDTO.builder()
                .id(group.getId())
                .name(group.getName())
                .code(group.getCode())
                .teacher(teacherDTO)
                .build();
    }

    private String generateGroupCode() {
        return "GRP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    @Transactional
    public GroupResponseDTO assignTeacherToGroup(Long groupId, Long teacherId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new EntityNotFoundException("Teacher not found with id: " + teacherId));

        group.setTeacher(teacher);
        group = groupRepository.save(group);

        // ВАЖНО: После сохранения нужно правильно сконвертировать в DTO
        return convertToDTO(group);
    }

    public GroupResponseDTO removeTeacherFromGroup(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        group.setTeacher(null);
        group = groupRepository.save(group);

        return convertToDTO(group);
    }
}