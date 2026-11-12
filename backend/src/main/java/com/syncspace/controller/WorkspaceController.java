package com.syncspace.controller;

import com.syncspace.dto.WorkspaceDto;
import com.syncspace.service.WorkspaceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceDto>> getWorkspaces(Authentication authentication) {
        List<WorkspaceDto> list = workspaceService.getUserWorkspaces(authentication.getName());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> createWorkspace(@RequestBody WorkspaceDto dto, Authentication authentication) {
        try {
            WorkspaceDto created = workspaceService.createWorkspace(dto, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

