package com.syncspace.service;

import com.syncspace.dto.AuthRequest;
import com.syncspace.dto.AuthResponse;
import com.syncspace.entity.User;
import com.syncspace.repository.UserRepository;
import com.syncspace.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AuthService contains the business logic for user authentication.
 * 
 * Uses Constructor-based Dependency Injection:
 * - UserRepository: For saving and finding users.
 * - PasswordEncoder: For BCrypt hashing and verification.
 * - JwtUtils: For issuing signed JWT tokens.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Transactional
    public AuthResponse register(AuthRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters.");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        // Hash the plain-text password using BCrypt before storing in database
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        String name = (request.getFullName() != null && !request.getFullName().isBlank())
                ? request.getFullName().trim()
                : normalizedEmail.split("@")[0];

        User user = new User(normalizedEmail, hashedPassword, name);
        User savedUser = userRepository.save(user);

        // Generate stateless JWT token
        String token = jwtUtils.generateToken(savedUser.getEmail());

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole()
        );
    }

    public AuthResponse login(AuthRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new IllegalArgumentException("Email and password are required.");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        // Match raw password with BCrypt hash stored in database
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        // Generate stateless JWT token
        String token = jwtUtils.generateToken(user.getEmail());

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        );
    }

    @Transactional
    public AuthResponse loginWithOAuth(com.syncspace.dto.OAuthRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("OAuth email is required.");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String provider = request.getProvider() != null ? request.getProvider().toUpperCase() : "GOOGLE";

        User user = userRepository.findByEmail(normalizedEmail).orElseGet(() -> {
            String name = (request.getFullName() != null && !request.getFullName().isBlank())
                    ? request.getFullName().trim()
                    : normalizedEmail.split("@")[0];

            User newUser = new User(normalizedEmail, "OAUTH_ACCOUNT_NO_PASSWORD", name);
            newUser.setProvider(provider);
            return userRepository.save(newUser);
        });

        String token = jwtUtils.generateToken(user.getEmail());

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        );
    }

    public AuthResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        return new AuthResponse(
                null,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        );
    }
}

