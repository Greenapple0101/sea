#!/bin/bash

# SCA 배포 스크립트
# EC2에서 실행되는 배포 스크립트 (Docker Compose 방식)

DEPLOY_DIR="/home/ubuntu/sca"

echo "🚀 배포 시작..."

# 배포 디렉토리로 이동
cd ${DEPLOY_DIR} || {
    echo "❌ 배포 디렉토리로 이동 실패: ${DEPLOY_DIR}"
    exit 1
}

# Docker 설치 확인 (이미 설치되어 있으면 스킵)
if ! command -v docker &> /dev/null; then
    echo "📦 Docker 설치 중..."
    # MySQL 레포지토리 오류 무시하고 업데이트
    sudo apt-get update -o Acquire::Check-Valid-Until=false -o Acquire::Check-Date=false 2>/dev/null || true
    sudo apt-get install -y docker.io 2>/dev/null || {
        echo "⚠️  Docker 설치 실패. 이미 설치되어 있을 수 있습니다."
    }
    sudo systemctl start docker || true
    sudo systemctl enable docker || true
    sudo usermod -aG docker ubuntu || true
fi

#  Compose 확인 (최신 Docker에는 기본 포함)
if ! docker compose version &> /dev/null; then
    echo "⚠️  docker compose 명령어를 사용할 수 없습니다."
    echo "⚠️  Docker Compose V2가 설치되어 있는지 확인하세요."
    exit 1
fi

# 환경 변수 파일 확인
if [ ! -f "${DEPLOY_DIR}/.env" ]; then
    echo "⚠️  환경 변수 파일이 없습니다: ${DEPLOY_DIR}/.env"
    echo "⚠️  기본 설정으로 계속 진행합니다..."
fi

# docker-compose.yml 파일 확인
if [ ! -f "${DEPLOY_DIR}/docker-compose.yml" ]; then
    echo "❌ docker-compose.yml 파일이 없습니다: ${DEPLOY_DIR}/docker-compose.yml"
    exit 1
fi

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너 정리 중..."
sudo docker compose down 2>/dev/null || true
sudo docker rm -f sca-fe sca-be 2>/dev/null || true

# Docker 이미지 로드
echo "🐳 Docker 이미지 로드 중..."
if [ -f "${DEPLOY_DIR}/sca-be.tar" ]; then
    sudo docker load -i "${DEPLOY_DIR}/sca-be.tar" || echo "⚠️  백엔드 이미지 로드 실패 (이미 로드되어 있을 수 있음)"
else
    echo "⚠️  sca-be.tar 파일이 없습니다. 이미지가 이미 로드되어 있을 수 있습니다."
fi

if [ -f "${DEPLOY_DIR}/sca-fe.tar" ]; then
    sudo docker load -i "${DEPLOY_DIR}/sca-fe.tar" || echo "⚠️  프론트엔드 이미지 로드 실패 (이미 로드되어 있을 수 있음)"
else
    echo "⚠️  sca-fe.tar 파일이 없습니다. 이미지가 이미 로드되어 있을 수 있습니다."
fi

# Docker Compose로 서비스 시작
echo "🚀 Docker Compose로 서비스 시작 중..."
sudo docker compose up -d --force-recreate

# 컨테이너 상태 확인
echo "⏳ 컨테이너 시작 대기 중..."
sleep 5

echo "📊 컨테이너 상태 확인 중..."
sudo docker compose ps

# 헬스 체크
echo "🏥 헬스 체크 중..."
BACKEND_HEALTH=$(curl -s http://localhost:8080/actuator/health 2>/dev/null || echo "")
FRONTEND_HEALTH=$(curl -s http://localhost:3000 2>/dev/null || echo "")

if [ -n "$BACKEND_HEALTH" ]; then
    echo "✅ 백엔드 헬스 체크 성공"
else
    echo "⚠️  백엔드 헬스 체크 실패 (시작 중일 수 있음)"
fi

if [ -n "$FRONTEND_HEALTH" ]; then
    echo "✅ 프론트엔드 헬스 체크 성공"
else
    echo "⚠️  프론트엔드 헬스 체크 실패 (시작 중일 수 있음)"
fi

echo ""
echo "✅ 배포 완료!"
echo "📊 백엔드: http://localhost:8080"
echo "📊 프론트엔드: http://localhost:3000"
echo ""
echo "💡 유용한 명령어:"
echo "  - 로그 확인: sudo docker compose logs -f"
echo "  - 서비스 중지: sudo docker compose down"
echo "  - 서비스 재시작: sudo docker compose restart"
echo "  - 컨테이너 상태: sudo docker compose ps"
