package com.carbon.notification.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class NotificationSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(NotificationSocketHandler.class);

    // Map to store User ID to WebSocketSession
    private static final Map<Long, WebSocketSession> userSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long userId = extractUserId(session.getUri());
        if (userId != null) {
            userSessions.put(userId, session);
            log.info("WebSocket connection established for User ID: {}", userId);
        } else {
            log.warn("WebSocket connection attempted without valid userId param.");
            session.close(CloseStatus.BAD_DATA);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long userId = extractUserId(session.getUri());
        if (userId != null) {
            userSessions.remove(userId);
            log.info("WebSocket connection closed for User ID: {}", userId);
        } else {
            // Fallback removal if URI parsing fails on close
            userSessions.values().remove(session);
        }
    }

    public void sendNotification(Long userId, String message) {
        WebSocketSession session = userSessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                session.sendMessage(new TextMessage(message));
                log.debug("Sent message to User ID: {}", userId);
            } catch (IOException e) {
                log.error("Failed to send message to User ID: {}", userId, e);
            }
        } else {
            log.debug("User {} is not connected. Notification dropped.", userId);
        }
    }

    private Long extractUserId(URI uri) {
        if (uri == null || uri.getQuery() == null)
            return null;

        String query = uri.getQuery(); // e.g., "userId=123"
        String[] params = query.split("&");
        for (String param : params) {
            if (param.startsWith("userId=")) {
                try {
                    return Long.parseLong(param.split("=")[1]);
                } catch (NumberFormatException e) {
                    return null;
                }
            }
        }
        return null;
    }
}
