// src/test/java/com/portfolio/controllers/WorkTypeControllerTest.java
package com.portfolio.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.models.WorkType;
import com.portfolio.security.JwtTokenProvider;
import com.portfolio.services.WorkTypeService;
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
@WebMvcTest(WorkTypeController.class)
public class WorkTypeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private WorkTypeService workTypeService;

    @TestConfiguration
    static class TestConfig {
        @Bean
        @Primary
        public JwtTokenProvider jwtTokenProvider() {
            return mock(JwtTokenProvider.class);
        }
    }

    @Test
    void getAllWorkTypes_returnsOk() throws Exception {
        when(workTypeService.getAllWorkTypes()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/work-types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getWorkTypeById_returnsOk() throws Exception {
        WorkType wt = new WorkType();
        wt.setId(1L);
        wt.setName("Курсовая");
        wt.setDescription("Курсовая работа");

        when(workTypeService.getWorkTypeById(1L)).thenReturn(wt);

        mockMvc.perform(get("/work-types/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Курсовая"));
    }

    @Test
    void createWorkType_returnsCreated() throws Exception {
        WorkType workType = new WorkType();
        workType.setName("Дипломная");
        workType.setDescription("Дипломная работа");

        WorkType createdWorkType = new WorkType();
        createdWorkType.setId(1L);
        createdWorkType.setName("Дипломная");
        createdWorkType.setDescription("Дипломная работа");

        when(workTypeService.createWorkType(any(WorkType.class))).thenReturn(createdWorkType);

        mockMvc.perform(post("/work-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(workType)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Дипломная"));
    }

    @Test
    void updateWorkType_returnsOk() throws Exception {
        WorkType workType = new WorkType();
        workType.setName("Обновленная курсовая");
        workType.setDescription("Обновленное описание");

        WorkType updatedWorkType = new WorkType();
        updatedWorkType.setId(1L);
        updatedWorkType.setName("Обновленная курсовая");
        updatedWorkType.setDescription("Обновленное описание");

        when(workTypeService.updateWorkType(eq(1L), any(WorkType.class))).thenReturn(updatedWorkType);

        mockMvc.perform(put("/work-types/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(workType)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Обновленная курсовая"));
    }

    @Test
    void deleteWorkType_returnsNoContent() throws Exception {
        doNothing().when(workTypeService).deleteWorkType(1L);

        mockMvc.perform(delete("/work-types/1"))
                .andExpect(status().isNoContent());
    }
}