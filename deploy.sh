#!/bin/bash

# SCA 배포 스크립트
# EC2에서 실행되는 배포 스크립트 (Docker 컨테이너 방식)

set -e

DEPLOY_DIR="/home/ubuntu/sca"
BACKEND_PORT=8080
FRONTEND_PORT=3000

echo "🚀 배포 시작..."

# Docker 설치 확인
if ! command -v docker &> /dev/null; then
    echo "📦 Docker 설치 중..."
    sudo apt-get update
    sudo apt-get install -y docker.io
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ubuntu
    echo "⚠️  Docker 설치 완료. ubuntu 사용자를 docker 그룹에 추가했습니다."
    echo "⚠️  로그아웃 후 다시 로그인하거나 'newgrp docker'를 실행하세요."
fi

# 환경 변수 파일 확인
if [ ! -f "${DEPLOY_DIR}/.env" ]; then
    echo "⚠️  환경 변수 파일이 없습니다. ${DEPLOY_DIR}/.env 파일을 생성해주세요."
    exit 1
fi

# Docker 네트워크 생성 (컨테이너 간 통신용)
echo "🌐 Docker 네트워크 생성 중..."
sudo docker network create sca-network || true

# 기존 컨테이너 제거
echo "🛑 기존 컨테이너 제거 중..."
sudo docker rm -f sca-fe || true
sudo docker rm -f sca-be || true

# 백엔드 컨테이너 실행
echo "🔧 백엔드 컨테이너 시작 중..."
sudo docker run -d \
  --name sca-be \
  --network sca-network \
  -p ${BACKEND_PORT}:8080 \
  --env-file ${DEPLOY_DIR}/.env \
  --restart unless-stopped \
  sca-be:latest

# 백엔드 시작 대기
echo "⏳ 백엔드 시작 대기 중..."
for i in {1..30}; do
    if curl -f http://localhost:${BACKEND_PORT}/actuator/health > /dev/null 2>&1; then
        echo "✅ 백엔드 시작 완료!"
        break
    fi
    sleep 2
done

# 프론트엔드 컨테이너 실행
echo "🔧 프론트엔드 컨테이너 시작 중..."
sudo docker run -d \
  --name sca-fe \
  --network sca-network \
  -p ${FRONTEND_PORT}:3000 \
  --restart unless-stopped \
  sca-fe:latest

# 프론트엔드 시작 대기
echo "⏳ 프론트엔드 시작 대기 중..."
sleep 5

# 컨테이너 상태 확인
echo "📊 컨테이너 상태 확인 중..."
sudo docker ps

echo "✅ 배포 완료!"
echo "📊 백엔드: http://localhost:${BACKEND_PORT}"
echo "📊 프론트엔드: http://localhost:${FRONTEND_PORT}"
