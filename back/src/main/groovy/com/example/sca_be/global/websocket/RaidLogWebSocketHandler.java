package com.example.sca_be.global.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.net.URI;

@Component
@RequiredArgsConstructor
@Slf4j
public class RaidLogWebSocketHandler extends TextWebSocketHandler {

    private final RaidLogSessionManager sessionManager;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Integer raidId = resolveRaidId(session.getUri());
        if (raidId == null) {
            log.warn("Closing session {} due to invalid raid id", session.getId());
            session.close(CloseStatus.BAD_DATA);
            return;
        }
        sessionManager.register(raidId, session);
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
        // Read-only channel, ignore messages from clients
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessionManager.remove(session);
    }

    private Integer resolveRaidId(URI uri) {
        if (uri == null) {
            return null;
        }

        String path = uri.getPath(); // e.g. /ws/raids/1/logs
        String[] segments = path.split("/");
        if (segments.length < 5) {
            return null;
        }

        try {
            return Integer.parseInt(segments[3]);
        } catch (NumberFormatException e) {
            log.warn("Invalid raid id in websocket path: {}", path);
            return null;
        }
    }
}

