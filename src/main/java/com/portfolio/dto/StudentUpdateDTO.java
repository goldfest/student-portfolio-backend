package com.portfolio.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class StudentUpdateDTO {

    @Email(message = "Invalid email format")
    private String email;

    private String bio;
    private String avatarUrl;

    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,}$",
            message = "Password must contain at least one letter and one number"
    )
    private String password; // Опционально

    private Boolean isActive;
    private Long groupId;
}