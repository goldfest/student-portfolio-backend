package com.portfolio.dto;

import com.portfolio.models.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
@Builder
@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private Role role;
    private String idName;
    private Long userId;
}