// src/test/java/com/portfolio/controllers/PortfolioItemControllerTest.java
package com.portfolio.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.dto.PortfolioItemDTO;
import com.portfolio.dto.PortfolioItemResponseDTO;
import com.portfolio.security.JwtTokenProvider;
import com.portfolio.services.PortfolioItemService;
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
import com.portfolio.dto.PortfolioItemDTO;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(PortfolioItemController.class)
public class PortfolioItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PortfolioItemService portfolioItemService;

    @TestConfiguration
    static class TestConfig {
        @Bean
        @Primary
        public JwtTokenProvider jwtTokenProvider() {
            return mock(JwtTokenProvider.class);
        }
    }

    @Test
    void getAllPortfolioItems_returnsOk() throws Exception {
        when(portfolioItemService.getAllPortfolioItems())
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/portfolio-items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getPortfolioItemById_returnsOk() throws Exception {
        var dto = PortfolioItemResponseDTO.builder()
                .id(1L)
                .title("Test")
                .completionDate(LocalDate.now())
                .build();

        when(portfolioItemService.getPortfolioItemById(1L))
                .thenReturn(dto);

        mockMvc.perform(get("/portfolio-items/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test"));
    }

    @Test
    void getPortfolioItemsByStudentId_returnsOk() throws Exception {
        when(portfolioItemService.getPortfolioItemsByStudentId(1L))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/portfolio-items/student/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getVerifiedPortfolioItems_returnsOk() throws Exception {
        when(portfolioItemService.getVerifiedPortfolioItems())
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/portfolio-items/verified"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void updateVerificationStatus_returnsOk() throws Exception {
        PortfolioItemResponseDTO responseDTO = PortfolioItemResponseDTO.builder()
                .id(1L)
                .title("Test Item")
                .isVerified(true)
                .build();

        when(portfolioItemService.updateVerificationStatus(1L, true))
                .thenReturn(responseDTO);

        mockMvc.perform(patch("/portfolio-items/1/verify")
                        .param("isVerified", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isVerified").value(true));
    }

    @Test
    void deletePortfolioItem_returnsNoContent() throws Exception {
        doNothing().when(portfolioItemService).deletePortfolioItem(1L);

        mockMvc.perform(delete("/portfolio-items/1"))
                .andExpect(status().isNoContent());
    }
}