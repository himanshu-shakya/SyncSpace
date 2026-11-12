package com.syncspace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the SyncSpace Spring Boot application.
 * 
 * @SpringBootApplication enables:
 * 1. @Configuration - Marks this class as a source of bean definitions.
 * 2. @EnableAutoConfiguration - Automatically configures Spring Boot based on jar dependencies on classpath.
 * 3. @ComponentScan - Tells Spring to scan for components (@RestController, @Service, @Repository) in this package and sub-packages.
 */
@SpringBootApplication
public class SyncSpaceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SyncSpaceApplication.class, args);
        System.out.println("=================================================");
        System.out.println("  SyncSpace Backend is running on port 8080!    ");
        System.out.println("  Test Endpoint: http://localhost:8080/api/health");
        System.out.println("=================================================");
    }
}

