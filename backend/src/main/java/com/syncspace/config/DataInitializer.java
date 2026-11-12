package com.syncspace.config;

import com.syncspace.entity.Document;
import com.syncspace.entity.User;
import com.syncspace.repository.DocumentRepository;
import com.syncspace.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * DataInitializer seeds default demo data upon application startup
 * if the database is fresh or empty.
 * 
 * Ensures the "Click to Auto-Fill Test Account" button on the login screen
 * always works reliably for college viva evaluations.
 */
@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository,
                                      DocumentRepository documentRepository,
                                      PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByEmail("alex@acme.dev")) {
                User alex = new User(
                        "alex@acme.dev",
                        passwordEncoder.encode("password123"),
                        "Alex Mercer"
                );
                userRepository.save(alex);
            }
            if (!userRepository.existsByEmail("student@college.edu")) {
                User demoUser = new User(
                        "student@college.edu",
                        passwordEncoder.encode("password123"),
                        "Student Demo"
                );
                User savedUser = userRepository.save(demoUser);

                Document welcomeDoc = new Document(
                        "Welcome to SyncSpace! 🚀",
                        "# Welcome to SyncSpace\n\nA collaborative knowledge base and Markdown editor.\n\n### Features:\n- **Real-Time Sync**: Changes broadcast live via WebSockets.\n- **Workspaces**: Organize documents into team hubs.\n- **Image Uploads**: Embed images and diagrams.\n\nStart typing to edit this note!",
                        savedUser
                );
                documentRepository.save(welcomeDoc);
                System.out.println("=================================================");
                System.out.println("  Demo Account Ready: student@college.edu       ");
                System.out.println("  Password: password123                         ");
                System.out.println("=================================================");
            }
        };
    }
}

