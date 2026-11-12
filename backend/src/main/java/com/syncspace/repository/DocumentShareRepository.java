package com.syncspace.repository;

import com.syncspace.entity.Document;
import com.syncspace.entity.DocumentShare;
import com.syncspace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentShareRepository extends JpaRepository<DocumentShare, Long> {

    List<DocumentShare> findByDocument(Document document);

    Optional<DocumentShare> findByDocumentAndUser(Document document, User user);

    List<DocumentShare> findByUser(User user);
}

