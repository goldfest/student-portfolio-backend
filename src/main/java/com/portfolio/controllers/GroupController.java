package com.portfolio.controllers;

import com.portfolio.dto.GroupResponseDTO;
import com.portfolio.models.Group;
import com.portfolio.services.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<GroupResponseDTO>> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllGroups());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<GroupResponseDTO> getGroupById(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupById(id));
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<GroupResponseDTO> getGroupByCode(@PathVariable String code) {
        return ResponseEntity.ok(groupService.getGroupByCode(code));
    }

    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('TEACHER') and #teacherId == authentication.principal.id)")
    public ResponseEntity<List<GroupResponseDTO>> getGroupsByTeacherId(@PathVariable Long teacherId) {
        return ResponseEntity.ok(groupService.getGroupsByTeacherId(teacherId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GroupResponseDTO> createGroup(@Valid @RequestBody Group group) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(groupService.createGroup(group));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GroupResponseDTO> updateGroup(
            @PathVariable Long id,
            @Valid @RequestBody Group group) {
        return ResponseEntity.ok(groupService.updateGroup(id, group));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        groupService.deleteGroup(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/regenerate-code")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> regenerateGroupCode(@PathVariable Long id) {
        String newCode = groupService.regenerateGroupCode(id);
        return ResponseEntity.ok(newCode);
    }

    @PutMapping("/{id}/teacher")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GroupResponseDTO> assignTeacherToGroup(
            @PathVariable Long id,
            @RequestBody Map<String, Long> request) {
        Long teacherId = request.get("teacherId");
        return ResponseEntity.ok(groupService.assignTeacherToGroup(id, teacherId));
    }

    @DeleteMapping("/{id}/teacher")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GroupResponseDTO> removeTeacherFromGroup(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.removeTeacherFromGroup(id));
    }
}