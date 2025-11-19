#!/bin/bash

# SCA 배포 스크립트
# EC2에서 실행되는 배포 스크립트 (Docker Compose 방식)

cd /home/ubuntu/sca

echo "📌 기존 컨테이너 종료"
docker compose down

echo "🐳 새 이미지 적용"
docker compose up -d

echo "🧼 불필요한 이미지 정리"
docker image prune -f

echo "✅ 배포 완료!"
echo "📊 백엔드: http://localhost:8081"
echo "📊 프론트엔드: http://localhost:3000"
