package com.example.sca_be.domain.auth.controller;

import com.example.sca_be.domain.auth.dto.*;
import com.example.sca_be.domain.auth.service.AuthService;
import com.example.sca_be.global.common.ApiResponse;
import com.example.sca_be.global.common.ApiVersion;
import com.example.sca_be.global.security.principal.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiVersion.AUTH)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 1. 선생님 회원가입
    @PostMapping("/teacher/signup")
    public ResponseEntity<ApiResponse<TeacherSignupResponse>> teacherSignup(
            @Valid @RequestBody TeacherSignupRequest request) {

        TeacherSignupResponse response = authService.teacherSignup(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("선생님 회원가입이 완료되었습니다.", response));
    }

    // 2. 학생 회원가입
    @PostMapping("/student/signup")
    public ResponseEntity<ApiResponse<StudentSignupResponse>> studentSignup(
            @Valid @RequestBody StudentSignupRequest request) {

        StudentSignupResponse response = authService.studentSignup(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("학생 회원가입이 완료되었습니다.", response));
    }

    // 3. 로그인
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Object>> login(
            @Valid @RequestBody LoginRequest request) {

        Object response = authService.login(request);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("로그인 성공", response));
    }

    // 4. 토큰 갱신
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {

        TokenResponse response = authService.refreshToken(request);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("토큰이 갱신되었습니다.", response));
    }

    // 5. 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody LogoutRequest request) {

        authService.logout(request);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("로그아웃되었습니다."));
    }

    // 6. 학생 프로필 조회
    @GetMapping("/student/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> getStudentProfile(
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Integer studentId = userDetails.getMemberId();
        
        StudentProfileResponse response = authService.getStudentProfile(studentId);
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(response));
    }
}
