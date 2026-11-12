package com.syncspace.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JwtUtils handles creation, parsing, and validation of JSON Web Tokens (JWT).
 * 
 * A JWT consists of 3 parts separated by dots:
 * 1. Header: Algorithm (HMAC-SHA256)
 * 2. Payload: Subject (User's email), Issued At, Expiration Time
 * 3. Signature: Cryptographic hash proving the token has not been tampered with
 */
@Component
public class JwtUtils {

    // 256-bit secret key for HMAC-SHA256 signing
    private static final String SECRET_STRING = "SyncSpaceSuperSecretKeyForJwtSigningMustBeAtLeast256BitsLong!";
    private static final long EXPIRATION_MS = 1000 * 60 * 60 * 24; // 24 hours

    private final SecretKey key = Keys.hmacShaKeyFor(SECRET_STRING.getBytes(StandardCharsets.UTF_8));

    /**
     * Generates a signed JWT token containing the user's email.
     */
    public String generateToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_MS);

        return Jwts.builder()
                .subject(email)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    /**
     * Extracts the email (subject) from a valid JWT token.
     */
    public String extractEmail(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    /**
     * Validates whether the token is authentic, unexpired, and properly signed.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}

