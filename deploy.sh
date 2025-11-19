#!/bin/bash

# SCA 배포 스크립트
# EC2에서 실행되는 배포 스크립트 (Docker Compose 방식)

cd /home/ubuntu/sca

# .env 파일 보호 확인 (절대 덮어쓰지 않음!)
if [ ! -f ".env" ]; then
    echo "❌ .env 파일이 없습니다!"
    echo "⚠️  EC2 서버의 /home/ubuntu/sca/.env 파일을 생성해주세요."
    exit 1
fi

# .env 파일 보호: 이 스크립트는 절대 .env 파일을 수정하거나 덮어쓰지 않음
# .env 파일은 EC2에서 직접 관리하며, 배포 시 그대로 사용됨
echo "✅ .env 파일 확인 완료 (EC2에서 관리, 절대 덮어쓰지 않음)"

echo "📌 기존 컨테이너 종료"
docker compose down

echo "🐳 새 이미지 적용"
docker compose up -d

echo "🧼 불필요한 이미지 정리"
docker image prune -f

echo "✅ 배포 완료!"
echo "📊 백엔드: http://localhost:8081"
echo "📊 프론트엔드: http://localhost:3000"
