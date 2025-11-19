package com.example.sca_be.global.config;

import com.example.sca_be.global.security.handler.CustomAccessDeniedHandler;
import com.example.sca_be.global.security.handler.CustomAuthenticationEntryPoint;
import com.example.sca_be.global.security.jwt.JwtAuthenticationFilter;
import com.example.sca_be.global.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity // Spring Security 설정을 활성화합니다.
@EnableMethodSecurity // @PreAuthorize, @Secured 등의 메서드 시큐리티 어노테이션을 활성화합니다.
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                //인증/인가 예외 핸들러 등록
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(customAuthenticationEntryPoint) // 401
                        .accessDeniedHandler(customAccessDeniedHandler)         // 403
                )
                // URL별 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // 인증 없이 접근 허용할 경로
                        .requestMatchers(
                                "/api/v1/auth/teacher/signup",   // 선생님 회원가입
                                "/api/v1/auth/student/signup",   // 학생 회원가입
                                "/api/v1/auth/login",            // 로그인
                                "/api/v1/auth/refresh",          // 토큰 재발급
                                "/swagger-ui/**",
                                "/h2-console/**",
                                "/favicon.ico",     //개발 용 database 접속
                                "/v3/api-docs/**", //api 문서
                                "/actuator/health",
                                "/api/actuator/health"//health check
                        ).permitAll()

                        //  'TEACHER' 권한이 필요한 경로
                        .requestMatchers(
                                "/api/v1/classes/**",                              // 반 생성, 조회, 학생 목록
                                "/api/v1/quests/personal",                         // 개인 퀘스트 생성 및 할당
                                "/api/v1/quests/personal/ai-recommend",            // AI 보상 추천 받기
                                "/api/v1/quests/personal/pending",                 // 개인 퀘스트 승인 대기 목록
                                "/api/v1/quests/personal/{assignmentId}/detail",   // 개인 퀘스트 상세(제출 내용 포함)
                                "/api/v1/quests/personal/{assignmentId}/approve",  // 개인 퀘스트 승인
                                "/api/v1/quests/personal/{assignmentId}/reject",   // 개인 퀘스트 반려
                                "/api/quests/group/**",                            // 단체 퀘스트 전체 (생성, 조회, 완료, 학생 체크)
                                "/api/v1/raids/creation-info",                     // 레이드 템플릿 조회
                                "/api/v1/raids",                                   // 레이드 생성 (POST)
                                "/api/v1/raids/{raidId}/detail",                   // 레이드 상세 조회 (선생님용)
                                "/api/v1/raids/{raidId}/terminate"                 // 레이드 강제 종료
                        ).hasRole("TEACHER")

                        // 'STUDENT' 권한이 필요한 경로
                        .requestMatchers(
                                "/api/v1/quests/personal/my",                      // 내 개인 퀘스트 목록
                                "/api/v1/quests/personal/{assignmentId}/submit",   // 개인 퀘스트 제출, 재제출
                                "/api/v1/quests/personal/{assignmentId}/comment",  // 퀘스트 코멘트 조회
                                "/api/students/**",                                // 학생 대시보드, 활동로그, 공지
                                "/api/v1/gacha/**",                                // 가챠 정보, 뽑기
                                "/api/v1/collection/**",                           // 수족관, 도감
                                "/api/v1/raids/my-raid",                          // 내 레이드 조회
                                "/api/v1/raids/{raidId}/attack"                    // 레이드 공격
                        ).hasRole("STUDENT")

                        // 그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated()
                )

                // JwtAuthenticationFilter 등록
                // UsernamePasswordAuthenticationFilter(기본 로그인 필터) 전에 실행
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtTokenProvider),
                        UsernamePasswordAuthenticationFilter.class
                )
                .headers(headers ->
                        headers.frameOptions(frameOptions -> frameOptions.sameOrigin())
                )

                .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(Arrays.asList(
                "https://app.sca.site",
                "https://teacher.sca.site",
                "http://localhost:3000"
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // 3600초

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 모든 경로에 적용. swagger도 열어야 해서 일단 이렇게 설정
        return source;
    }
}