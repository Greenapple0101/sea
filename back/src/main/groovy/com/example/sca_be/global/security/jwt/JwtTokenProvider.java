package com.example.sca_be.global.security.jwt;

import com.example.sca_be.global.security.service.CustomUserDetailsService;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}") // Access Token 만료 시간 (milliseconds)
    private long expirationTime;

    @Value("${jwt.refresh-expiration}") // Refresh Token 만료 시간 (milliseconds)
    private long refreshExpirationTime;

    private Key key;

    private final CustomUserDetailsService userDetailsService;

    @PostConstruct
    protected void init() {
        // secretKey를 바이트 배열로 변환하고 HMAC SHA 키를 생성
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    //login 성공 시 access token 생성
    public String createToken(Integer memberId, String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .setSubject(username) // 토큰의 주체 (로그인 username)
                .claim("memberId", memberId)
                .setIssuedAt(now) // 토큰 발행 시간
                .setExpiration(expiry) // 토큰 만료 시간
                .signWith(key, SignatureAlgorithm.HS256) // 사용할 암호화 알고리즘
                .compact();
    }

    //인증 정보 추출
    public Authentication getAuthentication(String token) {
        // 토큰에서 username(Subject)을 가져온다.
        String username = getUsername(token);

        // CustomUserDetailsService를 사용해 DB에서 실제 사용자 정보를 로드.
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        // Spring Security가 이해하는 Authentication 객체를 생성하여 반환(안에 권한 들어 있음)
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }

    //토큰에서 username 추출
    public String getUsername(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(key).build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (ExpiredJwtException e) {
            // 토큰이 만료되어도 username 정보는 가져올 수 있음
            return e.getClaims().getSubject();
        }
    }

    // "Bearer " 이후의 토큰 반환
    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    //토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            log.warn("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {
            log.warn("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            log.warn("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            log.warn("JWT 토큰이 잘못되었습니다.");
        }
        return false;
    }

    // Refresh Token 생성
    public String createRefreshToken(Integer memberId, String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshExpirationTime);

        return Jwts.builder()
                .setSubject(username)
                .claim("memberId", memberId)
                .claim("tokenType", "refresh")
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Access Token 만료 시간 반환 (초 단위)
    public long getExpirationTime() {
        return expirationTime / 1000;
    }
}