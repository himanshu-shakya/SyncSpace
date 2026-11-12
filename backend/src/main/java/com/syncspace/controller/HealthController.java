package com.syncspace.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * HealthController provides a simple sanity-check GET endpoint.
 * Used to verify that:
 * 1. The Spring Boot application is running and accessible.
 * 2. Embedded Tomcat is listening on port 8080.
 * 3. Spring MVC is dispatching HTTP requests and serializing Java objects to JSON.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> checkHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "SyncSpace Backend is running successfully!");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "SyncSpace Knowledge Management API");
        return response;
    }
}

