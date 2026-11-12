package com.syncspace.repository;

import com.syncspace.entity.Document;
import com.syncspace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * DocumentRepository provides database CRUD operations for Documents.
 * 
 * Demonstrates Spring Data JPA Query Derivation:
 * - findByOwnerOrderByUpdatedAtDesc: Generates SQL:
 *   SELECT * FROM documents WHERE owner_id = ? ORDER BY updated_at DESC
 * - findByIdAndOwner: Ensures a user can only access documents they own.
 */
@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByOwnerOrderByUpdatedAtDesc(User owner);

    Optional<Document> findByIdAndOwner(Long id, User owner);
}

