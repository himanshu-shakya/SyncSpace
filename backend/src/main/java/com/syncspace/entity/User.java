package com.syncspace.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * User Entity represents the 'users' table in the database.
 * 
 * Demonstrates Core Java & JPA Concepts:
 * - Encapsulation: Private fields with public getters and setters.
 * - @Entity: Maps this Java class to a relational database table.
 * - @Table(name = "users"): Specifies table name ('users' avoids PostgreSQL reserved word 'user').
 * - @Id & @GeneratedValue: Defines the primary key with auto-increment strategy.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String role; // e.g. "ROLE_USER"

    @Column(nullable = false)
    private String provider = "LOCAL"; // "LOCAL" or "GOOGLE"

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Default constructor (required by Hibernate)
    public User() {
    }

    // Parameterized constructor
    public User(String email, String passwordHash, String fullName) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.role = "ROLE_USER";
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.role == null) {
            this.role = "ROLE_USER";
        }
        if (this.provider == null) {
            this.provider = "LOCAL";
        }
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

