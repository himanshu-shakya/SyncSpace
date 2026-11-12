package com.syncspace.controller;

import com.syncspace.entity.Attachment;
import com.syncspace.entity.User;
import com.syncspace.repository.UserRepository;
import com.syncspace.service.FileStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * UploadController exposes multipart/form-data image upload endpoints.
 */
@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;

    public UploadController(FileStorageService fileStorageService, UserRepository userRepository) {
        this.fileStorageService = fileStorageService;
        this.userRepository = userRepository;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file,
                                        Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + authentication.getName()));

            Attachment attachment = fileStorageService.storeFile(file, user);

            Map<String, Object> response = new HashMap<>();
            response.put("url", attachment.getFileUrl());
            response.put("fileName", attachment.getOriginalFileName());
            response.put("size", attachment.getFileSize());
            response.put("fileType", attachment.getFileType());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Could not upload file: " + e.getMessage()));
        }
    }
}

