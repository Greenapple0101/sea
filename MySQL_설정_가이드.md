# MySQL 데이터베이스 설정 가이드

## 📋 필요한 환경 변수

백엔드가 정상 작동하려면 다음 환경 변수가 필요합니다:

### 데이터베이스 설정
- `DB_URL`: MySQL 연결 URL
- `DB_USERNAME`: 데이터베이스 사용자명
- `DB_PASSWORD`: 데이터베이스 비밀번호

### JWT 설정
- `JWT_SECRET`: JWT 서명용 시크릿 키 (최소 256비트)
- `JWT_EXPIRATION`: Access Token 만료 시간 (밀리초)
- `JWT_REFRESH_EXPIRATION`: Refresh Token 만료 시간 (밀리초)

---

## 🔧 EC2에서 환경 변수 설정

### 1. .env 파일 생성

EC2에 SSH 접속 후:

```bash
cd /home/ubuntu/sca
nano .env
```

### 2. 환경 변수 입력

```bash
# MySQL 데이터베이스 설정
DB_URL=jdbc:mysql://your-rds-endpoint.ap-northeast-2.rds.amazonaws.com:3306/sca_db
DB_USERNAME=admin
DB_PASSWORD=your_secure_password

# JWT 설정
JWT_SECRET=your-jwt-secret-key-must-be-at-least-256-bits-long-for-HS256-algorithm-security
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000
```

### 3. 파일 권한 설정

```bash
chmod 600 .env  # 소유자만 읽기/쓰기 가능
```

---

## 🗄️ RDS MySQL 설정

### 1. RDS 인스턴스 생성 (AWS 콘솔)

1. **RDS** → **데이터베이스 생성**
2. **엔진 옵션**: MySQL 선택
3. **템플릿**: 프로덕션 또는 개발/테스트
4. **설정**:
   - DB 인스턴스 식별자: `sca-db`
   - 마스터 사용자 이름: `admin` (또는 원하는 이름)
   - 마스터 암호: 강력한 비밀번호 설정
5. **인스턴스 구성**: `db.t3.micro` (테스트용) 또는 `db.t3.small` (프로덕션)
6. **스토리지**: 20GB (또는 필요에 따라)
7. **연결**: 
   - 퍼블릭 액세스: 예 (EC2에서 접근 가능하도록)
   - VPC: EC2와 같은 VPC
   - 보안 그룹: EC2 보안 그룹에서 포트 3306 허용

### 2. 데이터베이스 생성

RDS에 연결 후:

```sql
CREATE DATABASE sca_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 사용자 권한 설정 (선택사항)

```sql
CREATE USER 'sca_user'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON sca_db.* TO 'sca_user'@'%';
FLUSH PRIVILEGES;
```

---

## 🔒 보안 그룹 설정

### RDS 보안 그룹 인바운드 규칙

```
Type: MySQL/Aurora
Port: 3306
Source: EC2 보안 그룹 ID (또는 EC2 Private IP)
```

또는:

```
Type: MySQL/Aurora
Port: 3306
Source: 0.0.0.0/0 (테스트용, 프로덕션에서는 비권장)
```

---

## ✅ 배포 전 확인 사항

- [ ] RDS 인스턴스 생성 완료
- [ ] 데이터베이스 `sca_db` 생성 완료
- [ ] EC2에서 RDS로 연결 테스트 완료
- [ ] `/home/ubuntu/sca/.env` 파일 생성 완료
- [ ] 환경 변수 모두 입력 완료
- [ ] `.env` 파일 권한 설정 완료 (600)

---

## 🧪 연결 테스트

EC2에서 MySQL 연결 테스트:

```bash
# MySQL 클라이언트 설치
sudo apt-get update
sudo apt-get install -y mysql-client

# 연결 테스트
mysql -h your-rds-endpoint.ap-northeast-2.rds.amazonaws.com \
      -u admin \
      -p \
      sca_db
```

---

## 📝 .env 파일 예시

`.env.example` 파일을 참고하여 실제 `.env` 파일을 생성하세요:

```bash
cd /home/ubuntu/sca
cp .env.example .env
nano .env  # 실제 값으로 수정
```

---

## 🚀 배포 후 확인

배포 후 백엔드 로그 확인:

```bash
tail -f /home/ubuntu/sca/backend/logs/application.log
```

데이터베이스 연결 성공 메시지 확인:
- `HikariPool-1 - Starting...`
- `HikariPool-1 - Start completed.`

연결 실패 시:
- RDS 엔드포인트 확인
- 보안 그룹 설정 확인
- 데이터베이스 이름 확인
- 사용자명/비밀번호 확인

