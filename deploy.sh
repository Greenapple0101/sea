#!/bin/bash

# SCA 배포 스크립트
# EC2에서 실행되는 배포 스크립트 (Docker Compose 방식)

set -e

DEPLOY_DIR="/home/ubuntu/sca"

echo "🚀 배포 시작..."

# Docker 설치 확인
if ! command -v docker &> /dev/null; then
    echo "📦 Docker 설치 중..."
    sudo apt-get update
    sudo apt-get install -y docker.io docker-compose-plugin
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ubuntu
    echo "⚠️  Docker 설치 완료. ubuntu 사용자를 docker 그룹에 추가했습니다."
    echo "⚠️  로그아웃 후 다시 로그인하거나 'newgrp docker'를 실행하세요."
fi

# Docker Compose 플러그인 확인 (docker compose 명령어)
if ! docker compose version &> /dev/null; then
    echo "📦 Docker Compose 플러그인 설치 중..."
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
fi

# 환경 변수 파일 확인
if [ ! -f "${DEPLOY_DIR}/.env" ]; then
    echo "⚠️  환경 변수 파일이 없습니다. ${DEPLOY_DIR}/.env 파일을 생성해주세요."
    exit 1
fi

# docker-compose.yml 파일 확인
if [ ! -f "${DEPLOY_DIR}/docker-compose.yml" ]; then
    echo "❌ docker-compose.yml 파일이 없습니다."
    exit 1
fi

# 배포 디렉토리로 이동
cd ${DEPLOY_DIR}

# 기존 컨테이너 중지 및 제거
echo "🛑 기존 컨테이너 중지 및 제거 중..."
sudo docker compose down || true

# Docker 이미지 로드 (이미 로드되어 있으면 스킵)
echo "🐳 Docker 이미지 확인 중..."
if ! sudo docker images | grep -q "sca-be.*latest"; then
    echo "📦 백엔드 이미지 로드 중..."
    sudo docker load -i sca-be.tar || echo "⚠️  sca-be.tar 파일이 없습니다. 이미지가 이미 로드되어 있을 수 있습니다."
fi

if ! sudo docker images | grep -q "sca-fe.*latest"; then
    echo "📦 프론트엔드 이미지 로드 중..."
    sudo docker load -i sca-fe.tar || echo "⚠️  sca-fe.tar 파일이 없습니다. 이미지가 이미 로드되어 있을 수 있습니다."
fi

# Docker Compose로 서비스 시작
echo "🚀 Docker Compose로 서비스 시작 중..."
sudo docker compose up -d

# 컨테이너 상태 확인
echo "⏳ 컨테이너 시작 대기 중..."
sleep 5

echo "📊 컨테이너 상태 확인 중..."
sudo docker compose ps

echo "✅ 배포 완료!"
echo "📊 백엔드: http://localhost:8080"
echo "📊 프론트엔드: http://localhost:3000"
echo ""
echo "💡 유용한 명령어:"
echo "  - 로그 확인: sudo docker compose logs -f"
echo "  - 서비스 중지: sudo docker compose down"
echo "  - 서비스 재시작: sudo docker compose restart"
