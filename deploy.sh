#!/bin/bash

# SCA 배포 스크립트
# EC2에서 실행되는 배포 스크립트

set -e

DEPLOY_DIR="/home/ubuntu/sca"
BACKEND_DIR="${DEPLOY_DIR}/backend"
FRONTEND_DIR="${DEPLOY_DIR}/frontend"
BACKEND_PORT=8080
FRONTEND_PORT=3000
SERVICE_NAME="sca-backend"

echo "🚀 배포 시작..."

# Java 17 설치 확인 및 설치
if ! command -v java &> /dev/null || ! java -version 2>&1 | grep -q "17"; then
    echo "📦 Java 17 설치 중..."
    sudo apt-get update
    sudo apt-get install -y openjdk-17-jdk
fi

# Node.js 설치 확인 및 설치 (프론트엔드 서빙용)
if ! command -v node &> /dev/null; then
    echo "📦 Node.js 설치 중..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Nginx 설치 확인 및 설치
if ! command -v nginx &> /dev/null; then
    echo "📦 Nginx 설치 중..."
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# 기존 백엔드 프로세스 종료
echo "🛑 기존 백엔드 프로세스 종료 중..."
if pgrep -f "sca-be.jar" > /dev/null; then
    pkill -f "sca-be.jar" || true
    sleep 3
fi

# 환경 변수 파일 확인
if [ ! -f "${DEPLOY_DIR}/.env" ]; then
    echo "⚠️  환경 변수 파일이 없습니다. ${DEPLOY_DIR}/.env 파일을 생성해주세요."
    echo "예시 파일: ${DEPLOY_DIR}/.env.example 참고"
    exit 1
fi

# 백엔드 실행 (systemd 서비스 사용)
echo "🔧 백엔드 서비스 시작 중..."
if [ -f "/etc/systemd/system/sca-backend.service" ]; then
    sudo systemctl daemon-reload
    sudo systemctl restart sca-backend
    sudo systemctl enable sca-backend
    echo "✅ systemd 서비스로 백엔드 시작"
else
    # systemd 서비스가 없으면 직접 실행
    cd ${BACKEND_DIR}
    nohup java -jar \
        -Dspring.profiles.active=prod \
        -Dserver.port=${BACKEND_PORT} \
        sca-be.jar > logs/application.log 2>&1 &
    
    BACKEND_PID=$!
    echo "백엔드 PID: ${BACKEND_PID}"
    echo ${BACKEND_PID} > backend.pid
fi

# 백엔드 시작 대기
echo "⏳ 백엔드 시작 대기 중..."
for i in {1..30}; do
    if curl -f http://localhost:${BACKEND_PORT}/actuator/health > /dev/null 2>&1; then
        echo "✅ 백엔드 시작 완료!"
        break
    fi
    sleep 2
done

# systemd 서비스 파일 설치
echo "🔧 systemd 서비스 설정 중..."
if [ -f "${DEPLOY_DIR}/sca-backend.service" ]; then
    sudo cp ${DEPLOY_DIR}/sca-backend.service /etc/systemd/system/
    sudo systemctl daemon-reload
fi

# Nginx 설정
echo "🔧 Nginx 설정 중..."
if [ -f "${DEPLOY_DIR}/nginx-sca.conf" ]; then
    sudo cp ${DEPLOY_DIR}/nginx-sca.conf /etc/nginx/sites-available/sca-frontend
else
    # 기본 설정 파일 생성
    sudo tee /etc/nginx/sites-available/sca-frontend > /dev/null <<EOF
server {
    listen ${FRONTEND_PORT};
    server_name _;
    
    root ${FRONTEND_DIR};
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /ws {
        proxy_pass http://localhost:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF
fi

# Nginx 설정 활성화
sudo ln -sf /etc/nginx/sites-available/sca-frontend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx 설정 테스트 및 재시작
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "✅ 배포 완료!"
echo "📊 백엔드: http://localhost:${BACKEND_PORT}"
echo "📊 프론트엔드: http://localhost:${FRONTEND_PORT}"

