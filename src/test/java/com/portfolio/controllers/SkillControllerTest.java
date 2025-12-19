// src/test/java/com/portfolio/controllers/SkillControllerTest.java
package com.portfolio.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.models.Skill;
import com.portfolio.security.JwtTokenProvider;
import com.portfolio.services.SkillService;
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
@WebMvcTest(SkillController.class)
public class SkillControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SkillService skillService;

    @TestConfiguration
    static class TestConfig {
        @Bean
        @Primary
        public JwtTokenProvider jwtTokenProvider() {
            return mock(JwtTokenProvider.class);
        }
    }

    @Test
    void getAllSkills_returnsOk() throws Exception {
        when(skillService.getAllSkills()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/skills"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getSkillById_returnsOk() throws Exception {
        Skill skill = new Skill();
        skill.setId(1L);
        skill.setName("Java");
        skill.setCategory("Programming");

        when(skillService.getSkillById(1L)).thenReturn(skill);

        mockMvc.perform(get("/skills/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Java"));
    }

    @Test
    void getSkillsByCategory_returnsOk() throws Exception {
        when(skillService.getSkillsByCategory("Programming"))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/skills/category/Programming"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createSkill_returnsCreated() throws Exception {
        Skill skill = new Skill();
        skill.setName("Spring Boot");
        skill.setCategory("Backend");

        Skill createdSkill = new Skill();
        createdSkill.setId(1L);
        createdSkill.setName("Spring Boot");
        createdSkill.setCategory("Backend");

        when(skillService.createSkill(any(Skill.class))).thenReturn(createdSkill);

        mockMvc.perform(post("/skills")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(skill)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Spring Boot"));
    }

    @Test
    void updateSkill_returnsOk() throws Exception {
        Skill skill = new Skill();
        skill.setName("Updated Skill");
        skill.setCategory("Updated Category");

        Skill updatedSkill = new Skill();
        updatedSkill.setId(1L);
        updatedSkill.setName("Updated Skill");
        updatedSkill.setCategory("Updated Category");

        when(skillService.updateSkill(eq(1L), any(Skill.class))).thenReturn(updatedSkill);

        mockMvc.perform(put("/skills/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(skill)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Skill"));
    }

    @Test
    void deleteSkill_returnsNoContent() throws Exception {
        doNothing().when(skillService).deleteSkill(1L);

        mockMvc.perform(delete("/skills/1"))
                .andExpect(status().isNoContent());
    }
}