package com.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.Set;

@Data
public class PortfolioItemDTO {

    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String fileUrl;
    private String projectUrl;

    @NotNull(message = "Completion date is required")
    private LocalDate completionDate;

    private Boolean isVerified = false;

    @NotNull(message = "Work type is required")
    private Long workTypeId;

    @NotNull(message = "Student is required")
    private Long studentId;

    private Set<Long> skillIds;
}