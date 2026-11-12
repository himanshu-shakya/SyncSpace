package com.syncspace.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocketConfig configures STOMP messaging over WebSockets.
 * 
 * Flow:
 * 1. Clients connect via ws://localhost:8080/ws
 * 2. Clients subscribe to /topic/document/{id} to receive broadcast edits.
 * 3. Clients publish edits to /app/document/{id}/edit.
 * 4. The server receives the edit, updates the database, and broadcasts to all active subscribers.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enables simple memory-based message broker to broadcast to /topic/...
        config.enableSimpleBroker("/topic");
        // Prefix for incoming messages bound for @MessageMapping controller methods
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Native WebSocket endpoint
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");

        // SockJS fallback endpoint
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}

