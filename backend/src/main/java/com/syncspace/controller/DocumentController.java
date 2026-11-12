package com.syncspace.controller;

import com.syncspace.dto.DocumentDto;
import com.syncspace.dto.ShareDto;
import com.syncspace.dto.ShareRequest;
import com.syncspace.service.DocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * DocumentController exposes REST endpoints for documents and document sharing.
 */
@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    public ResponseEntity<?> getDocuments(Authentication authentication) {
        try {
            List<DocumentDto> documents = documentService.getUserDocuments(authentication.getName());
            return ResponseEntity.ok(documents);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDocumentById(@PathVariable Long id, Authentication authentication) {
        try {
            DocumentDto document = documentService.getDocumentById(id, authentication.getName());
            return ResponseEntity.ok(document);
        } catch (IllegalArgumentException e) {
            if (e.getMessage() != null && e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createDocument(@RequestBody DocumentDto dto, Authentication authentication) {
        try {
            DocumentDto created = documentService.createDocument(dto, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDocument(@PathVariable Long id,
                                            @RequestBody DocumentDto dto,
                                            Authentication authentication) {
        try {
            DocumentDto updated = documentService.updateDocument(id, dto, authentication.getName());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id, Authentication authentication) {
        try {
            documentService.deleteDocument(id, authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Document deleted successfully", "id", id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    // --- Sharing Endpoints ---

    @PostMapping("/{id}/share")
    public ResponseEntity<?> shareDocument(@PathVariable Long id,
                                           @RequestBody ShareRequest request,
                                           Authentication authentication) {
        try {
            ShareDto share = documentService.shareDocument(id, request, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(share);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/shares")
    public ResponseEntity<?> getDocumentShares(@PathVariable Long id, Authentication authentication) {
        try {
            List<ShareDto> shares = documentService.getDocumentShares(id, authentication.getName());
            return ResponseEntity.ok(shares);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/shares/{shareId}")
    public ResponseEntity<?> removeShare(@PathVariable Long id,
                                         @PathVariable Long shareId,
                                         Authentication authentication) {
        try {
            documentService.removeShare(id, shareId, authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Collaborator removed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
