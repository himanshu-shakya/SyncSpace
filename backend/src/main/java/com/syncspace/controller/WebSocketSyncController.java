package com.syncspace.controller;

import com.syncspace.dto.DocumentSyncMessage;
import com.syncspace.entity.Document;
import com.syncspace.repository.DocumentRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * WebSocketSyncController handles incoming STOMP messages from collaborators
 * and broadcasts updates to all active sessions viewing the same document.
 */
@Controller
public class WebSocketSyncController {

    private final DocumentRepository documentRepository;

    public WebSocketSyncController(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
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

        // Update database asynchronously with the latest content
        if ("EDIT".equals(message.getType())) {
            documentRepository.findById(id).ifPresent(doc -> {
                if (message.getTitle() != null && !message.getTitle().isBlank()) {
                    doc.setTitle(message.getTitle());
                }
                if (message.getContent() != null) {
                    doc.setContent(message.getContent());
                }
                documentRepository.save(doc);
            });
        }

        // Return message to be broadcast to all subscribers on /topic/document/{id}
        return message;
    }
}

