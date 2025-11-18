package com.example.sca_be.global.security.handler;

import com.example.sca_be.global.common.ApiResponse;
import com.example.sca_be.global.exception.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

//jwt로 인한 403 오류 발생 시
@Slf4j
@Component
@RequiredArgsConstructor
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {

        log.warn("인가 실패 (403) - 요청: {}, 원인: {}", request.getRequestURI(), accessDeniedException.getMessage());

        ErrorCode errorCode = ErrorCode.FORBIDDEN;

        ApiResponse<Void> apiResponse = ApiResponse.error(
                errorCode.name(),
                errorCode.getMessage()
        );

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        try {
            response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
        } catch (IOException e) {
            log.error("인가 실패 응답 전송 중 오류 발생", e);
        }
    }
}
