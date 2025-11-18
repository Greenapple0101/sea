-- ============================================
-- SCA 데이터베이스 및 사용자 생성 스크립트
-- ============================================

-- 1. 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS sca_db 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- 2. 사용자 생성 및 권한 부여
-- 방법 1: 새 사용자 생성 (권장)
CREATE USER IF NOT EXISTS 'sca_user'@'%' IDENTIFIED BY 'your_secure_password_here';

-- 방법 2: 기존 사용자 사용 시 아래 주석 해제
-- GRANT ALL PRIVILEGES ON sca_db.* TO 'your_existing_user'@'%';

-- 권한 부여
GRANT ALL PRIVILEGES ON sca_db.* TO 'sca_user'@'%';

-- 권한 적용
FLUSH PRIVILEGES;

-- 3. 데이터베이스 선택
USE sca_db;

-- ============================================
-- 테이블은 JPA가 자동으로 생성합니다 (ddl-auto: validate인 경우 수동 생성 필요)
-- 또는 application-prod.yaml에서 ddl-auto를 'update'로 변경하면 자동 생성됨
-- ============================================

-- 4. 테이블 수동 생성 (선택사항)
-- JPA가 자동 생성하지 않는 경우에만 사용
-- 백엔드 애플리케이션을 한 번 실행하면 엔티티 기반으로 테이블이 생성됩니다

-- ============================================
-- 사용 방법:
-- 1. MySQL에 root로 접속
-- 2. 이 스크립트 실행
-- 3. .env 파일에 사용자명과 비밀번호 입력
-- ============================================

