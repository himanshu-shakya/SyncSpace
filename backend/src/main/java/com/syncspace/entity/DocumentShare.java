package com.syncspace.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * DocumentShare Entity tracks document sharing permissions.
 * 
 * Roles:
 * - EDITOR: Can view and edit Markdown content.
 * - VIEWER: Can view the document in read-only mode.
 */
@Entity
@Table(name = "document_shares", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"document_id", "user_id"})
})
public class DocumentShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String role; // "EDITOR" or "VIEWER"

    @Column(nullable = false)
    private LocalDateTime sharedAt;

    public DocumentShare() {
    }

    public DocumentShare(Document document, User user, String role) {
        this.document = document;
        this.user = user;
        this.role = role != null ? role.toUpperCase() : "VIEWER";
        this.sharedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.sharedAt == null) {
            this.sharedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Document getDocument() {
        return document;
    }

    public void setDocument(Document document) {
        this.document = document;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role != null ? role.toUpperCase() : "VIEWER";
    }

    public LocalDateTime getSharedAt() {
        return sharedAt;
    }

    public void setSharedAt(LocalDateTime sharedAt) {
        this.sharedAt = sharedAt;
    }
}

