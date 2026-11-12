package com.syncspace.service;

import com.syncspace.entity.Attachment;
import com.syncspace.entity.User;
import com.syncspace.repository.AttachmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * FileStorageService manages uploading, validating, and storing files locally.
 */
@Service
public class FileStorageService {

    private final Path rootLocation = Paths.get("uploads").toAbsolutePath().normalize();
    private final AttachmentRepository attachmentRepository;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"
    );
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    public FileStorageService(AttachmentRepository attachmentRepository) {
        this.attachmentRepository = attachmentRepository;
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory: " + rootLocation, e);
        }
    }

    public Attachment storeFile(MultipartFile file, User user) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Failed to upload empty file.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10MB limit.");
        }

        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_EXTENSIONS.contains(contentType.toLowerCase())) {
            String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
            if (!filename.endsWith(".jpg") && !filename.endsWith(".jpeg") && !filename.endsWith(".png") &&
                !filename.endsWith(".gif") && !filename.endsWith(".webp") && !filename.endsWith(".svg")) {
                throw new IllegalArgumentException("Only image files (JPEG, PNG, GIF, WebP, SVG) are supported.");
            }
        }

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.png";
        // Clean filename and attach UUID to prevent overwriting
        String cleanName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String uniqueFileName = UUID.randomUUID().toString() + "-" + cleanName;

        try {
            Path destinationFile = this.rootLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl;
            try {
                fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/uploads/")
                        .path(uniqueFileName)
                        .toUriString();
            } catch (Exception e) {
                fileUrl = "/uploads/" + uniqueFileName;
            }

            Attachment attachment = new Attachment(
                    uniqueFileName,
                    originalName,
                    contentType != null ? contentType : "image/png",
                    file.getSize(),
                    fileUrl,
                    user
            );

            return attachmentRepository.save(attachment);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + uniqueFileName, e);
        }
    }
}
