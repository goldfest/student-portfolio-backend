// src/test/java/com/portfolio/controllers/StudentControllerTest.java
package com.portfolio.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.dto.StudentDTO;
import com.portfolio.dto.StudentResponseDTO;
import com.portfolio.dto.StudentUpdateDTO;
import com.portfolio.security.JwtTokenProvider;
import com.portfolio.services.StudentService;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(StudentController.class)
public class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StudentService studentService;

    @TestConfiguration
    static class TestConfig {
        @Bean
        @Primary
        public JwtTokenProvider jwtTokenProvider() {
            return mock(JwtTokenProvider.class);
        }
    }

    @Test
    void getAllStudents_returnsOk() throws Exception {
        List<StudentResponseDTO> students = Collections.emptyList();
        when(studentService.getAllStudents()).thenReturn(students);

        mockMvc.perform(get("/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getStudentById_returnsOk() throws Exception {
        StudentResponseDTO response = StudentResponseDTO.builder()
                .id(1L)
                .idName("student1")
                .email("s1@example.com")
                .build();

        when(studentService.getStudentById(1L)).thenReturn(response);

        mockMvc.perform(get("/students/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("s1@example.com"));
    }

    @Test
    void getStudentByEmail_returnsOk() throws Exception {
        StudentResponseDTO response = StudentResponseDTO.builder()
                .id(1L)
                .idName("student1")
                .email("s1@example.com")
                .build();

        when(studentService.getStudentByEmail("s1@example.com")).thenReturn(response);

        mockMvc.perform(get("/students/email/s1@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("s1@example.com"));
    }

    @Test
    void createStudent_returnsCreated() throws Exception {
        StudentDTO dto = StudentDTO.builder()
                .idName("student1")
                .email("s1@example.com")
                .password("Pass1234")
                .build();

        StudentResponseDTO response = StudentResponseDTO.builder()
                .id(1L)
                .idName("student1")
                .email("s1@example.com")
                .build();

        when(studentService.createStudent(any(StudentDTO.class))).thenReturn(response);

        mockMvc.perform(post("/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("s1@example.com"));
    }
    @Test
    void deleteStudent_returnsNoContent() throws Exception {
        doNothing().when(studentService).deleteStudent(1L);

        mockMvc.perform(delete("/students/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void getStudentsByTeacherId_returnsOk() throws Exception {
        List<StudentResponseDTO> students = Collections.emptyList();
        when(studentService.getStudentsByTeacherId(1L)).thenReturn(students);

        mockMvc.perform(get("/students/teacher/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
