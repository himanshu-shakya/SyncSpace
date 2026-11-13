package com.syncspace.controller;

import com.syncspace.dto.DocumentSyncMessage;
import com.syncspace.entity.Document;
import com.syncspace.entity.DocumentShare;
import com.syncspace.entity.User;
import com.syncspace.repository.DocumentRepository;
import com.syncspace.repository.DocumentShareRepository;
import com.syncspace.repository.UserRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * WebSocketSyncController handles incoming STOMP messages from collaborators
 * and strictly enforces RBAC permissions (OWNER, EDITOR, VIEWER) before persisting or broadcasting.
 */
@Controller
public class WebSocketSyncController {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final DocumentShareRepository documentShareRepository;

    public WebSocketSyncController(DocumentRepository documentRepository,
                                   UserRepository userRepository,
                                   DocumentShareRepository documentShareRepository) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.documentShareRepository = documentShareRepository;
    }

    /**
     * Listens on: /app/document/{id}/edit
     * Broadcasts to: /topic/document/{id}
     */
    @MessageMapping("/document/{id}/edit")
    @SendTo("/topic/document/{id}")
    @Transactional
    public DocumentSyncMessage handleDocumentEdit(@DestinationVariable Long id, DocumentSyncMessage message) {
        message.setTimestamp(LocalDateTime.now().toString());

        if (message.getSenderEmail() == null || message.getSenderEmail().isBlank()) {
            message.setType("REJECTED");
            return message;
        }

        String senderEmail = message.getSenderEmail().trim().toLowerCase();

        // 1. Verify Document exists
        Document doc = documentRepository.findById(id).orElse(null);
        if (doc == null) {
            message.setType("DOCUMENT_NOT_FOUND");
            return message;
        }

        // 2. Verify User exists
        User sender = userRepository.findByEmail(senderEmail).orElse(null);
        if (sender == null) {
            message.setType("UNAUTHORIZED");
            return message;
        }

        // 3. Resolve Effective Role
        String role = null;
        if (doc.getOwner().getId().equals(sender.getId())) {
            role = "OWNER";
        } else {
            Optional<DocumentShare> share = documentShareRepository.findByDocumentAndUser(doc, sender);
            role = share.map(DocumentShare::getRole).orElse(null);
        }

        // If access was revoked or user has no permission:
        if (role == null) {
            message.setType("ACCESS_REVOKED");
            message.setContent("Access revoked: You do not have permission to view or edit this document.");
            return message;
        }

        // If user is a VIEWER (read-only): reject edits
        if ("VIEWER".equalsIgnoreCase(role)) {
            if ("EDIT".equals(message.getType())) {
                message.setType("READ_ONLY_VIOLATION");
                message.setContent("Read-only access: Viewers cannot make edits.");
                return message;
            }
        }

        // If OWNER or EDITOR: process EDIT
        if ("EDIT".equals(message.getType())) {
            if (message.getTitle() != null && !message.getTitle().isBlank()) {
                doc.setTitle(message.getTitle());
            }
            if (message.getContent() != null) {
                doc.setContent(message.getContent());
            }
            documentRepository.save(doc);
        }

        return message;
    }
}
