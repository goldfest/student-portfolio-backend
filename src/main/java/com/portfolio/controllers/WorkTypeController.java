package com.portfolio.controllers;

import com.portfolio.models.WorkType;
import com.portfolio.services.WorkTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/work-types")
@RequiredArgsConstructor
public class WorkTypeController {

    private final WorkTypeService workTypeService;

    @GetMapping
    public ResponseEntity<List<WorkType>> getAllWorkTypes() {
        return ResponseEntity.ok(workTypeService.getAllWorkTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkType> getWorkTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(workTypeService.getWorkTypeById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<WorkType> createWorkType(@Valid @RequestBody WorkType workType) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workTypeService.createWorkType(workType));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<WorkType> updateWorkType(
            @PathVariable Long id,
            @Valid @RequestBody WorkType workType) {
        return ResponseEntity.ok(workTypeService.updateWorkType(id, workType));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteWorkType(@PathVariable Long id) {
        workTypeService.deleteWorkType(id);
        return ResponseEntity.noContent().build();
    }
}