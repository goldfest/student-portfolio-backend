package com.portfolio.controllers;

import com.portfolio.dto.PortfolioItemDTO;
import com.portfolio.dto.PortfolioItemResponseDTO;
import com.portfolio.services.PortfolioItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/portfolio-items")
@RequiredArgsConstructor
public class PortfolioItemController {

    private final PortfolioItemService portfolioItemService;

    @GetMapping
    public ResponseEntity<List<PortfolioItemResponseDTO>> getAllPortfolioItems() {
        return ResponseEntity.ok(portfolioItemService.getAllPortfolioItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortfolioItemResponseDTO> getPortfolioItemById(@PathVariable Long id) {
        return ResponseEntity.ok(portfolioItemService.getPortfolioItemById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<PortfolioItemResponseDTO>> getPortfolioItemsByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(portfolioItemService.getPortfolioItemsByStudentId(studentId));
    }

    @GetMapping("/verified")
    public ResponseEntity<List<PortfolioItemResponseDTO>> getVerifiedPortfolioItems() {
        return ResponseEntity.ok(portfolioItemService.getVerifiedPortfolioItems());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT')")
    public ResponseEntity<PortfolioItemResponseDTO> createPortfolioItem(@Valid @RequestBody PortfolioItemDTO portfolioItemDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(portfolioItemService.createPortfolioItem(portfolioItemDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT')")
    public ResponseEntity<PortfolioItemResponseDTO> updatePortfolioItem(
            @PathVariable Long id,
            @Valid @RequestBody PortfolioItemDTO portfolioItemDTO) {
        return ResponseEntity.ok(portfolioItemService.updatePortfolioItem(id, portfolioItemDTO));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<PortfolioItemResponseDTO> updateVerificationStatus(
            @PathVariable Long id,
            @RequestParam Boolean isVerified) {
        return ResponseEntity.ok(portfolioItemService.updateVerificationStatus(id, isVerified));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT')")
    public ResponseEntity<Void> deletePortfolioItem(@PathVariable Long id) {
        portfolioItemService.deletePortfolioItem(id);
        return ResponseEntity.noContent().build();
    }
}