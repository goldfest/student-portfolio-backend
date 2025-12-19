package com.portfolio.dto;

import com.portfolio.models.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Builder;
import lombok.Data;

@Data
@Builder

public class TeacherDTO {

    private Long id;

    @NotBlank(message = "ID Name is required")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "ID Name can only contain letters, numbers and underscores")
    private String idName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,}$",
            message = "Password must be at least 8 characters with at least one letter and one number"
    )
    private String password;

    private String bio;
    private String avatarUrl;
    private Role role = Role.TEACHER;
    private Boolean isActive = true;
}