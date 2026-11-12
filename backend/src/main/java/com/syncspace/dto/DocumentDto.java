package com.syncspace.dto;

import java.time.LocalDateTime;

/**
 * Data Transfer Object (DTO) for Document payloads.
 * Includes user permission role ("OWNER", "EDITOR", "VIEWER") and optional workspaceId.
 */
public class DocumentDto {

    private Long id;
    private String title;
    private String content;
    private Long ownerId;
    private String ownerName;
    private String role; // "OWNER", "EDITOR", "VIEWER"
    private Long workspaceId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DocumentDto() {
    }

    public DocumentDto(Long id, String title, String content, Long ownerId, String ownerName, String role, Long workspaceId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.ownerId = ownerId;
        this.ownerName = ownerName;
        this.role = role;
        this.workspaceId = workspaceId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(Long workspaceId) {
        this.workspaceId = workspaceId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
