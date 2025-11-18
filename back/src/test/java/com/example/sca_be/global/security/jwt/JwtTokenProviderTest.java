package com.example.sca_be.global.security.jwt;

import com.example.sca_be.global.security.service.CustomUserDetailsService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.Collections;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;

/**
 * JwtTokenProvider 단위 테스트
 * - JWT 토큰 생성, 검증, 파싱 로직 테스트
 */
@ExtendWith(MockitoExtension.class)
class JwtTokenProviderTest {

    @InjectMocks
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private CustomUserDetailsService userDetailsService;

    private static final String SECRET_KEY = "test-secret-key-must-be-at-least-256-bits-long-for-HS256-algorithm-security";
    private static final long EXPIRATION_TIME = 900000L; // 15분
    private static final long REFRESH_EXPIRATION_TIME = 604800000L; // 7일

    @BeforeEach
    void setUp() {
        // ReflectionTestUtils를 사용하여 private 필드에 값 주입
        ReflectionTestUtils.setField(jwtTokenProvider, "secretKey", SECRET_KEY);
        ReflectionTestUtils.setField(jwtTokenProvider, "expirationTime", EXPIRATION_TIME);
        ReflectionTestUtils.setField(jwtTokenProvider, "refreshExpirationTime", REFRESH_EXPIRATION_TIME);

        // @PostConstruct 메서드 수동 호출
        ReflectionTestUtils.invokeMethod(jwtTokenProvider, "init");
    }

    @Test
    @DisplayName("Access Token 생성 성공")
    void createToken_Success() {
        // given
        Integer memberId = 1;
        String username = "testuser";

        // when
        String token = jwtTokenProvider.createToken(memberId, username);

        // then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();

        // 토큰에서 username 추출하여 검증
        String extractedUsername = jwtTokenProvider.getUsername(token);
        assertThat(extractedUsername).isEqualTo(username);
    }

    @Test
    @DisplayName("Refresh Token 생성 성공")
    void createRefreshToken_Success() {
        // given
        Integer memberId = 1;
        String username = "testuser";

        // when
        String refreshToken = jwtTokenProvider.createRefreshToken(memberId, username);

        // then
        assertThat(refreshToken).isNotNull();
        assertThat(refreshToken).isNotEmpty();

        // 토큰에서 username 추출하여 검증
        String extractedUsername = jwtTokenProvider.getUsername(refreshToken);
        assertThat(extractedUsername).isEqualTo(username);
    }

    @Test
    @DisplayName("토큰에서 username 추출 성공")
    void getUsername_Success() {
        // given
        String username = "testuser";
        String token = jwtTokenProvider.createToken(1, username);

        // when
        String extractedUsername = jwtTokenProvider.getUsername(token);

        // then
        assertThat(extractedUsername).isEqualTo(username);
    }

    @Test
    @DisplayName("유효한 토큰 검증 성공")
    void validateToken_ValidToken_Success() {
        // given
        String token = jwtTokenProvider.createToken(1, "testuser");

        // when
        boolean isValid = jwtTokenProvider.validateToken(token);

        // then
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("잘못된 토큰 검증 실패")
    void validateToken_InvalidToken_Fail() {
        // given
        String invalidToken = "invalid.token.here";

        // when
        boolean isValid = jwtTokenProvider.validateToken(invalidToken);

        // then
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("만료된 토큰 검증 실패")
    void validateToken_ExpiredToken_Fail() {
        // given
        Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
        Date now = new Date();
        Date expiry = new Date(now.getTime() - 1000); // 이미 만료된 시간

        String expiredToken = Jwts.builder()
                .setSubject("testuser")
                .claim("memberId", 1)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key)
                .compact();

        // when
        boolean isValid = jwtTokenProvider.validateToken(expiredToken);

        // then
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("HTTP 요청에서 Bearer 토큰 추출 성공")
    void resolveToken_WithBearerPrefix_Success() {
        // given
        MockHttpServletRequest request = new MockHttpServletRequest();
        String token = "test.jwt.token";
        request.addHeader("Authorization", "Bearer " + token);

        // when
        String resolvedToken = jwtTokenProvider.resolveToken(request);

        // then
        assertThat(resolvedToken).isEqualTo(token);
    }

    @Test
    @DisplayName("HTTP 요청에서 Bearer 접두사 없는 경우 null 반환")
    void resolveToken_WithoutBearerPrefix_ReturnsNull() {
        // given
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "test.jwt.token");

        // when
        String resolvedToken = jwtTokenProvider.resolveToken(request);

        // then
        assertThat(resolvedToken).isNull();
    }

    @Test
    @DisplayName("HTTP 요청에 Authorization 헤더가 없는 경우 null 반환")
    void resolveToken_NoAuthorizationHeader_ReturnsNull() {
        // given
        MockHttpServletRequest request = new MockHttpServletRequest();

        // when
        String resolvedToken = jwtTokenProvider.resolveToken(request);

        // then
        assertThat(resolvedToken).isNull();
    }

    @Test
    @DisplayName("토큰에서 인증 정보 추출 성공")
    void getAuthentication_Success() {
        // given
        String username = "testuser";
        String token = jwtTokenProvider.createToken(1, username);

        UserDetails userDetails = User.builder()
                .username(username)
                .password("password")
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_TEACHER")))
                .build();

        given(userDetailsService.loadUserByUsername(anyString())).willReturn(userDetails);

        // when
        Authentication authentication = jwtTokenProvider.getAuthentication(token);

        // then
        assertThat(authentication).isNotNull();
        assertThat(authentication.getName()).isEqualTo(username);
        assertThat(authentication.getAuthorities())
                .extracting("authority")
                .contains("ROLE_TEACHER");
    }

    @Test
    @DisplayName("토큰 만료 시간 조회 성공")
    void getExpirationTime_Success() {
        // when
        long expirationTime = jwtTokenProvider.getExpirationTime();

        // then
        assertThat(expirationTime).isEqualTo(EXPIRATION_TIME / 1000); // 초 단위로 반환
    }

    @Test
    @DisplayName("Access Token과 Refresh Token의 만료 시간이 다름")
    void accessTokenAndRefreshToken_HaveDifferentExpiration() throws InterruptedException {
        // given
        String username = "testuser";
        String accessToken = jwtTokenProvider.createToken(1, username);

        // 토큰 생성 시간을 구분하기 위해 잠시 대기
        Thread.sleep(100);

        String refreshToken = jwtTokenProvider.createRefreshToken(1, username);

        // when
        boolean accessTokenValid = jwtTokenProvider.validateToken(accessToken);
        boolean refreshTokenValid = jwtTokenProvider.validateToken(refreshToken);

        // then
        assertThat(accessTokenValid).isTrue();
        assertThat(refreshTokenValid).isTrue();

        // 두 토큰은 서로 다른 값이어야 함
        assertThat(accessToken).isNotEqualTo(refreshToken);
    }

    @Test
    @DisplayName("만료된 토큰에서도 username 추출 가능")
    void getUsername_FromExpiredToken_Success() {
        // given
        Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
        String username = "testuser";
        Date now = new Date();
        Date expiry = new Date(now.getTime() - 1000); // 이미 만료된 시간

        String expiredToken = Jwts.builder()
                .setSubject(username)
                .claim("memberId", 1)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key)
                .compact();

        // when
        String extractedUsername = jwtTokenProvider.getUsername(expiredToken);

        // then
        assertThat(extractedUsername).isEqualTo(username);
    }
}