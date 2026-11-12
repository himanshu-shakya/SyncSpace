package com.syncspace.dto;

import java.time.LocalDateTime;

public class ShareDto {

    private Long id;
    private Long userId;
    private String userEmail;
    private String userName;
    private String role;
    private LocalDateTime sharedAt;

    public ShareDto() {
    }

    public ShareDto(Long id, Long userId, String userEmail, String userName, String role, LocalDateTime sharedAt) {
        this.id = id;
        this.userId = userId;
        this.userEmail = userEmail;
        this.userName = userName;
        this.role = role;
        this.sharedAt = sharedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getSharedAt() {
        return sharedAt;
    }

    public void setSharedAt(LocalDateTime sharedAt) {
        this.sharedAt = sharedAt;
    }
}

