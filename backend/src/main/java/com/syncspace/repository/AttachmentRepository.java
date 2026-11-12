package com.syncspace.repository;

import com.syncspace.entity.Attachment;
import com.syncspace.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByUploadedByOrderByUploadedAtDesc(User uploadedBy);
}

