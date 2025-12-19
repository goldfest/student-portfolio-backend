package com.portfolio.services;

import com.portfolio.dto.PortfolioItemDTO;
import com.portfolio.models.Student;
import com.portfolio.models.WorkType;
import com.portfolio.repositories.*;
import com.portfolio.services.PortfolioItemService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PortfolioItemServiceTest {

    @Mock
    private PortfolioItemRepository portfolioItemRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private WorkTypeRepository workTypeRepository;
    @Mock
    private SkillRepository skillRepository;
    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private PortfolioItemService service;

    private PortfolioItemDTO validDto;

    @BeforeEach
    void setUp() {
        // Только данные — никаких when() здесь!
        validDto = PortfolioItemDTO.builder()
                .title("Test Project")
                .description("Description")
                .completionDate(LocalDate.now())
                .isVerified(false)
                .workTypeId(1L)
                .studentId(1L)
                .skillIds(new HashSet<>())
                .build();
    }

    @Test
    void createPortfolioItem_success() {
        // Настройка моков ТОЛЬКО для этого теста
        when(studentRepository.findById(1L)).thenReturn(Optional.of(new Student()));
        when(workTypeRepository.findById(1L)).thenReturn(Optional.of(new WorkType()));
        when(portfolioItemRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = service.createPortfolioItem(validDto);

        assertNotNull(result);
        assertEquals("Test Project", result.getTitle());
        verify(portfolioItemRepository, times(1)).save(any());
    }

    @Test
    void createPortfolioItem_studentNotFound_throws() {
        // Только нужный мок
        when(studentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.createPortfolioItem(validDto));

        // Убедимся, что save НЕ вызывался
        verify(portfolioItemRepository, never()).save(any());
    }
}