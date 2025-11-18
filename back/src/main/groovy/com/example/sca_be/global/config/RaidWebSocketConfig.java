package com.example.sca_be.global.config;

import com.example.sca_be.global.websocket.RaidLogWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class RaidWebSocketConfig implements WebSocketConfigurer {

    private final RaidLogWebSocketHandler raidLogWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(raidLogWebSocketHandler, "/ws/raids/*/logs")
                .setAllowedOriginPatterns("*");
    }
}

