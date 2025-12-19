// src/test/java/com/portfolio/controllers/TeacherControllerTest.java
package com.portfolio.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.dto.TeacherDTO;
import com.portfolio.dto.TeacherResponseDTO;
import com.portfolio.security.JwtTokenProvider;
import com.portfolio.services.TeacherService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(TeacherController.class)
public class TeacherControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TeacherService teacherService;

    @TestConfiguration
    static class TestConfig {
        @Bean
        @Primary
        public JwtTokenProvider jwtTokenProvider() {
            return mock(JwtTokenProvider.class);
        }
    }

    @Test
    void getAllTeachers_returnsOk() throws Exception {
        when(teacherService.getAllTeachers()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/teachers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getTeacherById_returnsOk() throws Exception {
        TeacherResponseDTO response = TeacherResponseDTO.builder()
                .id(1L)
                .idName("teacher1")
                .email("t1@example.com")
                .build();

        when(teacherService.getTeacherById(1L)).thenReturn(response);

        mockMvc.perform(get("/teachers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("t1@example.com"));
    }

    @Test
    void getTeacherByEmail_returnsOk() throws Exception {
        TeacherResponseDTO response = TeacherResponseDTO.builder()
                .id(1L)
                .idName("teacher1")
                .email("t1@example.com")
                .build();

        when(teacherService.getTeacherByEmail("t1@example.com")).thenReturn(response);

        mockMvc.perform(get("/teachers/email/t1@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("t1@example.com"));
    }

    @Test
    void createTeacher_returnsCreated() throws Exception {
        TeacherDTO dto = TeacherDTO.builder()
                .idName("teacher1")
                .email("t1@example.com")
                .password("Pass1234")
                .build();

        TeacherResponseDTO response = TeacherResponseDTO.builder()
                .id(1L)
                .idName("teacher1")
                .email("t1@example.com")
                .build();

        when(teacherService.createTeacher(any(TeacherDTO.class))).thenReturn(response);

        mockMvc.perform(post("/teachers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("t1@example.com"));
    }


    @Test
    void deleteTeacher_returnsNoContent() throws Exception {
        doNothing().when(teacherService).deleteTeacher(1L);

        mockMvc.perform(delete("/teachers/1"))
                .andExpect(status().isNoContent());
    }
}