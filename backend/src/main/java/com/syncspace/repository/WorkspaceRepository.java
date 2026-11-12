package com.syncspace.repository;

import com.syncspace.entity.User;
import com.syncspace.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    List<Workspace> findByOwnerOrderByCreatedAtDesc(User owner);
}

