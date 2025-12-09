package com.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioItemResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String fileUrl;
    private String projectUrl;
    private LocalDate completionDate;
    private Boolean isVerified;
    private LocalDateTime createdAt;

    private WorkTypeDTO workType;
    private StudentSimpleDTO student;
    private Set<SkillSimpleDTO> skills;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkTypeDTO {
        private Long id;
        private String name;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentSimpleDTO {
        private Long id;
        private String idName;
        private String email;
        private String bio;
        private String avatarUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillSimpleDTO {
        private Long id;
        private String name;
        private String category;
    }
}