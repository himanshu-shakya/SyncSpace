package com.syncspace.service;

import com.syncspace.dto.WorkspaceDto;
import com.syncspace.entity.User;
import com.syncspace.entity.Workspace;
import com.syncspace.repository.UserRepository;
import com.syncspace.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository, UserRepository userRepository) {
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    private WorkspaceDto toDto(Workspace ws) {
        return new WorkspaceDto(
                ws.getId(),
                ws.getName(),
                ws.getDescription(),
                ws.getOwner().getId(),
                ws.getOwner().getFullName(),
                ws.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<WorkspaceDto> getUserWorkspaces(String email) {
        User user = getUserByEmail(email);
        return workspaceRepository.findByOwnerOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkspaceDto createWorkspace(WorkspaceDto dto, String email) {
        User user = getUserByEmail(email);
        String name = (dto.getName() != null && !dto.getName().isBlank())
                ? dto.getName()
                : "New Workspace";

        Workspace ws = new Workspace(name, dto.getDescription(), user);
        Workspace saved = workspaceRepository.save(ws);
        return toDto(saved);
    }
}

