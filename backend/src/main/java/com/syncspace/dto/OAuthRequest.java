package com.syncspace.dto;

/**
 * Data Transfer Object for OAuth authentication requests.
 */
public class OAuthRequest {

    private String email;
    private String fullName;
    private String provider; // e.g. "GOOGLE"

    public OAuthRequest() {
    }

    public OAuthRequest(String email, String fullName, String provider) {
        this.email = email;
        this.fullName = fullName;
        this.provider = provider;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }
}

