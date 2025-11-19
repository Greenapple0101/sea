# 환경 변수 설정 가이드

## EC2 서버의 `/home/ubuntu/sca/.env` 파일에 다음 내용이 필요합니다:

```bash
# Database Configuration
DB_URL=jdbc:mysql://host.docker.internal:3306/sca_db
DB_USERNAME=sca_user
DB_PASSWORD=scaStrong#2025!

# JWT Configuration (백엔드 개발자에게 확인 필요)
JWT_SECRET=your-jwt-secret-key-must-be-at-least-256-bits-long-for-HS256-algorithm-security
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

# Spring Profile
SPRING_PROFILES_ACTIVE=prod
```

## JWT 설정 설명

백엔드 `application-prod.yaml`에서 다음 환경 변수를 요구합니다:

- **JWT_SECRET**: JWT 토큰 서명에 사용되는 비밀키 (최소 256비트 이상 필요)
- **JWT_EXPIRATION**: Access Token 만료 시간 (밀리초 단위, 기본값: 900000 = 15분)
- **JWT_REFRESH_EXPIRATION**: Refresh Token 만료 시간 (밀리초 단위, 기본값: 604800000 = 7일)

## 백엔드 개발자에게 확인할 사항

1. **JWT_SECRET 값**: 프로덕션 환경에 맞는 안전한 비밀키 필요
2. **토큰 만료 시간**: Access Token과 Refresh Token의 만료 시간 확인
3. **보안 요구사항**: JWT_SECRET은 반드시 안전하게 관리되어야 함

## 참고

- 개발 환경(`application-dev.yaml`)에는 기본값이 있지만, 프로덕션에서는 환경 변수로 주입해야 합니다.
- JWT_SECRET은 절대 코드에 하드코딩하지 말고 환경 변수로 관리해야 합니다.

