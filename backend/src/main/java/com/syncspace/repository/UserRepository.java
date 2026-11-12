package com.syncspace.repository;

import com.syncspace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * UserRepository provides database CRUD operations for the User entity.
 * 
 * Extends JpaRepository<User, Long>:
 * - 'User' is the domain entity.
 * - 'Long' is the primary key type.
 * 
 * Spring Data JPA automatically provides standard methods:
 * save(), findById(), findAll(), deleteById(), count(), etc.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Derived Query Method: Spring Data automatically generates the SQL:
    // SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);

    // Checks if an email is already registered before creating an account
    boolean existsByEmail(String email);
}

