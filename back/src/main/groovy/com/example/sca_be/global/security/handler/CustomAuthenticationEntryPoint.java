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
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

//jwt에서 401번 처리
@Slf4j
@Component
@RequiredArgsConstructor
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        log.warn("인증 실패 (401) - 요청: {}, 원인: {}", request.getRequestURI(), authException.getMessage());

        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;

        // GlobalExceptionHandler와 동일한 응답 형식
        ApiResponse<Void> apiResponse = ApiResponse.error(
                errorCode.name(),
                errorCode.getMessage()
        );

        // 응답 상태코드, Content-Type, 인코딩 설정
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        //JSON 문자열로 변환하여 응답에 쓰기
        try {
            response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
        } catch (IOException e) {
            log.error("인증 실패 응답 전송 중 오류 발생", e);
        }
    }
}