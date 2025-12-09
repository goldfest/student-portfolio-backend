package com.portfolio.services;

import com.portfolio.dto.PortfolioItemDTO;
import com.portfolio.dto.PortfolioItemResponseDTO;
import com.portfolio.models.*;
import com.portfolio.repositories.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortfolioItemService {

    private final PortfolioItemRepository portfolioItemRepository;
    private final StudentRepository studentRepository;
    private final WorkTypeRepository workTypeRepository;
    private final SkillRepository skillRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<PortfolioItemResponseDTO> getAllPortfolioItems() {
        return portfolioItemRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PortfolioItemResponseDTO getPortfolioItemById(Long id) {
        PortfolioItem portfolioItem = portfolioItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Portfolio item not found with id: " + id));
        return convertToDTO(portfolioItem);
    }

    @Transactional(readOnly = true)
    public List<PortfolioItemResponseDTO> getPortfolioItemsByStudentId(Long studentId) {
        return portfolioItemRepository.findByStudentId(studentId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PortfolioItemResponseDTO> getVerifiedPortfolioItems() {
        return portfolioItemRepository.findByIsVerified(true).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PortfolioItemResponseDTO createPortfolioItem(PortfolioItemDTO portfolioItemDTO) {
        PortfolioItem portfolioItem = new PortfolioItem();
        mapDtoToEntity(portfolioItemDTO, portfolioItem);
        PortfolioItem saved = portfolioItemRepository.save(portfolioItem);
        return convertToDTO(saved);
    }

    @Transactional
    public PortfolioItemResponseDTO updatePortfolioItem(Long id, PortfolioItemDTO portfolioItemDTO) {
        PortfolioItem portfolioItem = portfolioItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Portfolio item not found with id: " + id));

        mapDtoToEntity(portfolioItemDTO, portfolioItem);
        PortfolioItem updated = portfolioItemRepository.save(portfolioItem);
        return convertToDTO(updated);
    }

    @Transactional
    public PortfolioItemResponseDTO updateVerificationStatus(Long id, Boolean isVerified) {
        PortfolioItem portfolioItem = portfolioItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Portfolio item not found with id: " + id));

        portfolioItem.setIsVerified(isVerified);
        PortfolioItem updated = portfolioItemRepository.save(portfolioItem);
        return convertToDTO(updated);
    }

    @Transactional
    public void deletePortfolioItem(Long id) {
        PortfolioItem portfolioItem = portfolioItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Portfolio item not found with id: " + id));

        if (portfolioItem.getFileUrl() != null) {
            fileStorageService.deleteFile(portfolioItem.getFileUrl());
        }
        portfolioItemRepository.delete(portfolioItem);
    }

    private PortfolioItemResponseDTO convertToDTO(PortfolioItem portfolioItem) {
        PortfolioItemResponseDTO.WorkTypeDTO workTypeDTO = null;
        if (portfolioItem.getWorkType() != null) {
            workTypeDTO = PortfolioItemResponseDTO.WorkTypeDTO.builder()
                    .id(portfolioItem.getWorkType().getId())
                    .name(portfolioItem.getWorkType().getName())
                    .description(portfolioItem.getWorkType().getDescription())
                    .build();
        }

        PortfolioItemResponseDTO.StudentSimpleDTO studentDTO = null;
        if (portfolioItem.getStudent() != null) {
            studentDTO = PortfolioItemResponseDTO.StudentSimpleDTO.builder()
                    .id(portfolioItem.getStudent().getId())
                    .idName(portfolioItem.getStudent().getIdName())
                    .email(portfolioItem.getStudent().getEmail())
                    .bio(portfolioItem.getStudent().getBio())
                    .avatarUrl(portfolioItem.getStudent().getAvatarUrl())
                    .build();
        }

        Set<PortfolioItemResponseDTO.SkillSimpleDTO> skillDTOs = new HashSet<>();
        if (portfolioItem.getSkills() != null) {
            skillDTOs = portfolioItem.getSkills().stream()
                    .map(skill -> PortfolioItemResponseDTO.SkillSimpleDTO.builder()
                            .id(skill.getId())
                            .name(skill.getName())
                            .category(skill.getCategory())
                            .build())
                    .collect(Collectors.toSet());
        }

        return PortfolioItemResponseDTO.builder()
                .id(portfolioItem.getId())
                .title(portfolioItem.getTitle())
                .description(portfolioItem.getDescription())
                .fileUrl(portfolioItem.getFileUrl())
                .projectUrl(portfolioItem.getProjectUrl())
                .completionDate(portfolioItem.getCompletionDate())
                .isVerified(portfolioItem.getIsVerified())
                .createdAt(portfolioItem.getCreatedAt())
                .workType(workTypeDTO)
                .student(studentDTO)
                .skills(skillDTOs)
                .build();
    }

    private void mapDtoToEntity(PortfolioItemDTO dto, PortfolioItem entity) {
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setProjectUrl(dto.getProjectUrl());
        entity.setCompletionDate(dto.getCompletionDate());
        entity.setIsVerified(dto.getIsVerified());

        // Устанавливаем студента
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));
        entity.setStudent(student);

        // Устанавливаем тип работы
        WorkType workType = workTypeRepository.findById(dto.getWorkTypeId())
                .orElseThrow(() -> new EntityNotFoundException("Work type not found"));
        entity.setWorkType(workType);

        // Устанавливаем навыки
        if (dto.getSkillIds() != null && !dto.getSkillIds().isEmpty()) {
            Set<Skill> skills = new HashSet<>();
            for (Long skillId : dto.getSkillIds()) {
                Skill skill = skillRepository.findById(skillId)
                        .orElseThrow(() -> new EntityNotFoundException("Skill not found with id: " + skillId));
                skills.add(skill);
            }
            entity.setSkills(skills);
        }
    }
}