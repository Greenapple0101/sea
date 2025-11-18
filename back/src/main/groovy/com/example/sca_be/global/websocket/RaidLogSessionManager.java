package com.example.sca_be.global.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class RaidLogSessionManager {

    private final Map<Integer, Set<WebSocketSession>> raidSessions = new ConcurrentHashMap<>();
    private final Map<String, Integer> sessionRaidMap = new ConcurrentHashMap<>();

    public void register(Integer raidId, WebSocketSession session) {
        raidSessions.computeIfAbsent(raidId, key -> Collections.newSetFromMap(new ConcurrentHashMap<>()))
                .add(session);
        sessionRaidMap.put(session.getId(), raidId);
        log.debug("Registered WebSocket session {} for raid {}", session.getId(), raidId);
    }

    public void remove(WebSocketSession session) {
        Integer raidId = sessionRaidMap.remove(session.getId());
        if (raidId == null) {
            return;
        }

        Set<WebSocketSession> sessions = raidSessions.get(raidId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                raidSessions.remove(raidId);
            }
        }
        log.debug("Removed WebSocket session {} from raid {}", session.getId(), raidId);
    }

    public void broadcast(Integer raidId, String payload) {
        Set<WebSocketSession> sessions = raidSessions.get(raidId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }

        for (WebSocketSession session : sessions) {
            try {
                if (session.isOpen()) {
                    session.sendMessage(new org.springframework.web.socket.TextMessage(payload));
                }
            } catch (IOException e) {
                log.warn("Failed to send raid log message to session {}", session.getId(), e);
            }
        }
    }
}

