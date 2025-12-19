package com.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupUpdateDTO {
    private String name;
    private String code;
    private Long teacherId; // ← Только ID, не весь объект Teacher
}