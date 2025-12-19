// src/test/java/com/portfolio/controllers/GroupControllerTest.java
package com.portfolio.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.dto.GroupResponseDTO;
import com.portfolio.models.Group;
import com.portfolio.security.JwtTokenProvider;
import com.portfolio.services.GroupService;
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
import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(GroupController.class)
public class GroupControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GroupService groupService;

    @TestConfiguration
    static class TestConfig {
        @Bean
        @Primary
        public JwtTokenProvider jwtTokenProvider() {
            return mock(JwtTokenProvider.class);
        }
    }

    @Test
    void getAllGroups_returnsOk() throws Exception {
        when(groupService.getAllGroups()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/groups"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getGroupById_returnsOk() throws Exception {
        GroupResponseDTO dto = GroupResponseDTO.builder()
                .id(1L)
                .name("Group 1")
                .code("GRP001")
                .build();

        when(groupService.getGroupById(1L)).thenReturn(dto);

        mockMvc.perform(get("/groups/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Group 1"));
    }

    @Test
    void getGroupByCode_returnsOk() throws Exception {
        GroupResponseDTO dto = GroupResponseDTO.builder()
                .id(1L)
                .name("Group 1")
                .code("GRP001")
                .build();

        when(groupService.getGroupByCode("GRP001")).thenReturn(dto);

        mockMvc.perform(get("/groups/code/GRP001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("GRP001"));
    }

    @Test
    void getGroupsByTeacherId_returnsOk() throws Exception {
        when(groupService.getGroupsByTeacherId(1L)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/groups/teacher/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createGroup_returnsCreated() throws Exception {
        Group group = new Group();
        group.setName("New Group");

        GroupResponseDTO response = GroupResponseDTO.builder()
                .id(1L)
                .name("New Group")
                .code("NEW001")
                .build();

        when(groupService.createGroup(any(Group.class))).thenReturn(response);

        mockMvc.perform(post("/groups")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(group)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Group"));
    }

    @Test
    void updateGroup_returnsOk() throws Exception {
        Group group = new Group();
        group.setName("Updated Group");

        GroupResponseDTO response = GroupResponseDTO.builder()
                .id(1L)
                .name("Updated Group")
                .code("UPD001")
                .build();

        when(groupService.updateGroup(eq(1L), any(Group.class))).thenReturn(response);

        mockMvc.perform(put("/groups/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(group)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Group"));
    }

    @Test
    void deleteGroup_returnsNoContent() throws Exception {
        doNothing().when(groupService).deleteGroup(1L);

        mockMvc.perform(delete("/groups/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void regenerateGroupCode_returnsOk() throws Exception {
        when(groupService.regenerateGroupCode(1L)).thenReturn("NEWCODE123");

        mockMvc.perform(patch("/groups/1/regenerate-code"))
                .andExpect(status().isOk())
                .andExpect(content().string("NEWCODE123"));
    }



}