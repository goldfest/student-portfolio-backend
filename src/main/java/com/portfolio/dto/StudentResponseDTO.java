package com.portfolio.dto;

import com.portfolio.models.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponseDTO {
    private Long id;
    private String idName;
    private String email;
    private String bio;
    private String avatarUrl;
    private Boolean isActive;
    private Role role;
    private LocalDateTime createdAt;
    private GroupSimpleDTO group;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupSimpleDTO {
        private Long id;
        private String name;
        private String code;
    }
}