# MySQL 계정 및 데이터베이스 생성 가이드

## 📋 필요한 작업

1. MySQL 서버에 접속
2. 데이터베이스 생성
3. 사용자 계정 생성 및 권한 부여
4. 테이블 생성 (JPA 자동 또는 수동)

---

## 🔧 방법 1: SQL 스크립트 사용 (권장)

### 1. MySQL에 접속

```bash
# 로컬 MySQL인 경우
mysql -u root -p

# RDS인 경우
mysql -h your-rds-endpoint.ap-northeast-2.rds.amazonaws.com \
      -u admin \
      -p
```

### 2. 스크립트 실행

```sql
-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS sca_db 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- 사용자 생성
CREATE USER IF NOT EXISTS 'sca_user'@'%' IDENTIFIED BY 'your_secure_password_here';

-- 권한 부여
GRANT ALL PRIVILEGES ON sca_db.* TO 'sca_user'@'%';
FLUSH PRIVILEGES;
```

또는 `database_setup.sql` 파일을 사용:

```bash
mysql -u root -p < database_setup.sql
```

---

## 🔧 방법 2: 수동 생성

### 1. 데이터베이스 생성

```sql
CREATE DATABASE sca_db 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;
```

### 2. 사용자 생성

```sql
CREATE USER 'sca_user'@'%' IDENTIFIED BY 'your_secure_password';
```

### 3. 권한 부여

```sql
GRANT ALL PRIVILEGES ON sca_db.* TO 'sca_user'@'%';
FLUSH PRIVILEGES;
```

---

## 🔧 방법 3: 기존 사용자 사용

기존 MySQL 사용자가 있다면:

```sql
-- 데이터베이스만 생성
CREATE DATABASE sca_db 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- 기존 사용자에 권한 부여
GRANT ALL PRIVILEGES ON sca_db.* TO 'your_existing_user'@'%';
FLUSH PRIVILEGES;
```

---

## 📝 테이블 생성 방법

### 방법 A: JPA 자동 생성 (권장)

`application-prod.yaml`에서 `ddl-auto`를 `update`로 변경:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # validate → update로 변경
```

백엔드 애플리케이션을 실행하면 엔티티 기반으로 테이블이 자동 생성됩니다.

### 방법 B: 수동 생성

`ddl-auto: validate`를 유지하고 싶다면:

1. 백엔드를 개발 환경에서 한 번 실행 (ddl-auto: create-drop 또는 update)
2. 생성된 테이블 구조를 SQL로 추출
3. 프로덕션 데이터베이스에 적용

---

## ✅ 생성 확인

### 데이터베이스 확인

```sql
SHOW DATABASES;
-- sca_db가 보여야 함
```

### 사용자 확인

```sql
SELECT user, host FROM mysql.user WHERE user = 'sca_user';
```

### 권한 확인

```sql
SHOW GRANTS FOR 'sca_user'@'%';
```

### 테이블 확인 (애플리케이션 실행 후)

```sql
USE sca_db;
SHOW TABLES;
```

예상되는 테이블:
- members
- students
- teachers
- classes
- quests
- quest_assignments
- submissions
- group_quests
- group_quest_progress
- raids
- contributions
- raid_logs
- collections
- collection_entries
- fish
- notice
- action_logs

---

## 🔒 보안 권장사항

1. **강력한 비밀번호 사용**
   - 최소 12자 이상
   - 대소문자, 숫자, 특수문자 포함

2. **IP 제한** (가능한 경우)
   ```sql
   -- 특정 IP에서만 접속 허용
   CREATE USER 'sca_user'@'10.0.0.%' IDENTIFIED BY 'password';
   ```

3. **최소 권한 원칙**
   ```sql
   -- 읽기 전용 사용자가 필요한 경우
   GRANT SELECT ON sca_db.* TO 'sca_readonly'@'%';
   ```

---

## 📝 .env 파일 설정

EC2의 `/home/ubuntu/sca/.env` 파일:

```bash
# MySQL 데이터베이스 설정
DB_URL=jdbc:mysql://your-rds-endpoint:3306/sca_db
DB_USERNAME=sca_user
DB_PASSWORD=your_secure_password_here

# JWT 설정
JWT_SECRET=your-jwt-secret-key-must-be-at-least-256-bits-long-for-HS256-algorithm-security
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000
```

---

## 🧪 연결 테스트

EC2에서 연결 테스트:

```bash
# MySQL 클라이언트 설치
sudo apt-get update
sudo apt-get install -y mysql-client

# 연결 테스트
mysql -h your-rds-endpoint \
      -u sca_user \
      -p \
      sca_db
```

비밀번호 입력 후 접속되면 성공!

---

## ✅ 체크리스트

- [ ] MySQL 서버 접속 가능
- [ ] 데이터베이스 `sca_db` 생성 완료
- [ ] 사용자 `sca_user` 생성 완료 (또는 기존 사용자 사용)
- [ ] 권한 부여 완료
- [ ] `.env` 파일에 DB 정보 입력 완료
- [ ] 백엔드 애플리케이션 실행하여 테이블 생성 확인

---

## 🚀 다음 단계

1. 데이터베이스 및 사용자 생성 완료
2. EC2에 `.env` 파일 생성
3. 백엔드 배포
4. 애플리케이션 실행 시 테이블 자동 생성 확인

