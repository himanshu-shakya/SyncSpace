package com.syncspace.service;

import com.syncspace.dto.DocumentDto;
import com.syncspace.dto.ShareDto;
import com.syncspace.dto.ShareRequest;
import com.syncspace.entity.Document;
import com.syncspace.entity.DocumentShare;
import com.syncspace.entity.User;
import com.syncspace.repository.DocumentRepository;
import com.syncspace.repository.DocumentShareRepository;
import com.syncspace.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * DocumentService handles document CRUD operations and permission enforcement.
 * 
 * Role hierarchy:
 * - OWNER: Full control (edit, share, delete).
 * - EDITOR: Can read and edit content.
 * - VIEWER: Read-only access.
 */
@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final DocumentShareRepository documentShareRepository;

    public DocumentService(DocumentRepository documentRepository,
                           UserRepository userRepository,
                           DocumentShareRepository documentShareRepository) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.documentShareRepository = documentShareRepository;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    private DocumentDto toDto(Document doc, String role) {
        Long workspaceId = doc.getWorkspace() != null ? doc.getWorkspace().getId() : null;
        return new DocumentDto(
                doc.getId(),
                doc.getTitle(),
                doc.getContent(),
                doc.getOwner().getId(),
                doc.getOwner().getFullName(),
                role,
                workspaceId,
                doc.getCreatedAt(),
                doc.getUpdatedAt()
        );
    }

    /**
     * Resolves the effective permission role of a user for a document.
     * Returns "OWNER", "EDITOR", "VIEWER", or null if no access.
     */
    private String resolveUserRole(Document doc, User user) {
        if (doc.getOwner().getId().equals(user.getId())) {
            return "OWNER";
        }
        Optional<DocumentShare> share = documentShareRepository.findByDocumentAndUser(doc, user);
        return share.map(DocumentShare::getRole).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<DocumentDto> getUserDocuments(String userEmail) {
        User user = getUserByEmail(userEmail);

        // 1. Owned documents
        List<Document> owned = documentRepository.findByOwnerOrderByUpdatedAtDesc(user);
        List<DocumentDto> result = new ArrayList<>();
        for (Document d : owned) {
            result.add(toDto(d, "OWNER"));
        }

        // 2. Shared documents
        List<DocumentShare> shares = documentShareRepository.findByUser(user);
        for (DocumentShare s : shares) {
            result.add(toDto(s.getDocument(), s.getRole()));
        }

        return result;
    }

    @Transactional(readOnly = true)
    public DocumentDto getDocumentById(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with ID: " + id));

        String role = resolveUserRole(document, user);
        if (role == null) {
            throw new IllegalArgumentException("Access denied: You do not have permission to view this document.");
        }

        return toDto(document, role);
    }

    @Transactional
    public DocumentDto createDocument(DocumentDto dto, String userEmail) {
        User user = getUserByEmail(userEmail);
        String title = (dto.getTitle() != null && !dto.getTitle().isBlank())
                ? dto.getTitle()
                : "Untitled Document";

        Document document = new Document(title, dto.getContent(), user);
        Document saved = documentRepository.save(document);
        return toDto(saved, "OWNER");
    }

    @Transactional
    public DocumentDto updateDocument(Long id, DocumentDto dto, String userEmail) {
        User user = getUserByEmail(userEmail);
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with ID: " + id));

        String role = resolveUserRole(document, user);
        if (role == null || role.equals("VIEWER")) {
            throw new IllegalArgumentException("Access denied: Viewers cannot edit this document.");
        }

        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            document.setTitle(dto.getTitle());
        }
        if (dto.getContent() != null) {
            document.setContent(dto.getContent());
        }

        Document updated = documentRepository.save(document);
        return toDto(updated, role);
    }

    @Transactional
    public void deleteDocument(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with ID: " + id));

        // Only the OWNER can delete a document
        if (!document.getOwner().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Access denied: Only the document owner can delete this document.");
        }

        // Delete all shares first
        List<DocumentShare> shares = documentShareRepository.findByDocument(document);
        documentShareRepository.deleteAll(shares);

        documentRepository.delete(document);
    }

    // --- Sharing Methods ---

    @Transactional
    public ShareDto shareDocument(Long docId, ShareRequest request, String ownerEmail) {
        User owner = getUserByEmail(ownerEmail);
        Document document = documentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with ID: " + docId));

        if (!document.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Only the document owner can share this document.");
        }

        User targetUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User with email '" + request.getEmail() + "' was not found."));

        if (targetUser.getId().equals(owner.getId())) {
            throw new IllegalArgumentException("You are already the owner of this document.");
        }

        // Update existing share or create new one
        Optional<DocumentShare> existing = documentShareRepository.findByDocumentAndUser(document, targetUser);
        DocumentShare share;
        if (existing.isPresent()) {
            share = existing.get();
            share.setRole(request.getRole());
        } else {
            share = new DocumentShare(document, targetUser, request.getRole());
        }

        DocumentShare saved = documentShareRepository.save(share);

        return new ShareDto(
                saved.getId(),
                targetUser.getId(),
                targetUser.getEmail(),
                targetUser.getFullName(),
                saved.getRole(),
                saved.getSharedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<ShareDto> getDocumentShares(Long docId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Document document = documentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with ID: " + docId));

        String role = resolveUserRole(document, user);
        if (role == null) {
            throw new IllegalArgumentException("Access denied.");
        }

        return documentShareRepository.findByDocument(document)
                .stream()
                .map(s -> new ShareDto(
                        s.getId(),
                        s.getUser().getId(),
                        s.getUser().getEmail(),
                        s.getUser().getFullName(),
                        s.getRole(),
                        s.getSharedAt()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeShare(Long docId, Long shareId, String ownerEmail) {
        User owner = getUserByEmail(ownerEmail);
        Document document = documentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with ID: " + docId));

        if (!document.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Only the document owner can remove sharing.");
        }

        documentShareRepository.deleteById(shareId);
    }
}
