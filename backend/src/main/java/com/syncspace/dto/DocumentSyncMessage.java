package com.syncspace.dto;

import java.time.LocalDateTime;

/**
 * Real-Time Document Synchronization Message payload.
 * Transmitted over WebSocket STOMP frames between connected users.
 */
public class DocumentSyncMessage {

    private Long documentId;
    private String senderEmail;
    private String senderName;
    private String title;
    private String content;
    private String type; // "EDIT" or "JOIN"
    private String timestamp;

    public DocumentSyncMessage() {
    }

    public DocumentSyncMessage(Long documentId, String senderEmail, String senderName, String title, String content, String type) {
        this.documentId = documentId;
        this.senderEmail = senderEmail;
        this.senderName = senderName;
        this.title = title;
        this.content = content;
        this.type = type;
        this.timestamp = LocalDateTime.now().toString();
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public void setSenderEmail(String senderEmail) {
        this.senderEmail = senderEmail;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}

