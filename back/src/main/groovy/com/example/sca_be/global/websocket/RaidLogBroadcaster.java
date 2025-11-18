package com.example.sca_be.global.websocket;

import com.example.sca_be.domain.raid.dto.RaidLogMessage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RaidLogBroadcaster {

    private final RaidLogSessionManager sessionManager;
    private final ObjectMapper objectMapper;

    public void broadcast(RaidLogMessage message) {
        try {
            String payload = objectMapper.writeValueAsString(message);
            sessionManager.broadcast(message.getRaidId(), payload);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize raid log message", e);
        }
    }
}

