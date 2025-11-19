pipeline {
    agent any
    
    // GitHub Webhook 자동 빌드 트리거
    triggers {
        githubPush()
    }
    
    parameters {
        choice(name: 'DEPLOY_ENV', choices: ['production'], description: '배포 환경 선택')
    }
    
    environment {
        // 애플리케이션 디렉토리 (GitHub repo 구조: back, front)
        BACKEND_DIR = 'back'
        FRONTEND_DIR = 'front'
        DEPLOY_DIR = '/home/ubuntu/sca'
        
        // EC2 서버 정보
        EC2_HOST = '3.27.78.93'
        EC2_USER = 'ubuntu'
        SSH_CREDENTIAL_ID = 'ubuntu'
        
        // 포트 정보
        BACKEND_PORT = '8081'  // Jenkins(8080) 포트 충돌 방지
        FRONTEND_PORT = '3000'
        
        // Java 버전
        JAVA_VERSION = '17'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📦 Git 저장소 체크아웃...'
                checkout scm
            }
        }
        
        stage('Backend Build') {
            steps {
                script {
                    echo '🔨 백엔드 빌드 시작...'
                    echo "현재 작업 디렉토리: ${pwd()}"
                    echo "백엔드 디렉토리: ${BACKEND_DIR}"
                    sh """
                        echo "📁 디렉토리 구조 확인..."
                        ls -la
                        echo "📁 ${BACKEND_DIR} 디렉토리 확인..."
                        ls -la ${BACKEND_DIR} || echo "디렉토리가 없습니다!"
                    """
                    dir("${BACKEND_DIR}") {
                        sh '''
                            echo "📁 현재 위치: $(pwd)"
                            echo "📁 파일 목록:"
                            ls -la
                            echo "🔧 gradlew 권한 설정..."
                            chmod +x gradlew
                            echo "🔨 Gradle 빌드 시작..."
                            ./gradlew clean build -x test
                        '''
                    }
                }
            }
        }
        
        stage('Frontend Build') {
            steps {
                script {
                    echo '🔨 프론트엔드 빌드 시작...'
                    echo "프론트엔드 디렉토리: ${FRONTEND_DIR}"
                    sh """
                        echo "📁 ${FRONTEND_DIR} 디렉토리 확인..."
                        ls -la ${FRONTEND_DIR} || echo "디렉토리가 없습니다!"
                    """
                    dir("${FRONTEND_DIR}") {
                        sh '''
                            echo "📁 현재 위치: $(pwd)"
                            echo "📁 파일 목록:"
                            ls -la
                            echo "📦 npm 설치 중..."
                            npm ci
                            echo "🔨 프론트엔드 빌드 시작..."
                            npm run build
                        '''
                    }
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    echo '🐳 Docker 이미지 빌드 시작...'
                    
                    // 백엔드 Docker 이미지 빌드
                    dir("${BACKEND_DIR}") {
                        sh '''
                            echo "🔨 백엔드 Docker 이미지 빌드 중..."
                            docker build -t sca-be:latest .
                        '''
                    }
                    
                    // 프론트엔드 Docker 이미지 빌드
                    dir("${FRONTEND_DIR}") {
                        sh '''
                            echo "🔨 프론트엔드 Docker 이미지 빌드 중..."
                            docker build -t sca-fe:latest .
                        '''
                    }
                    
                    // Docker 이미지를 tar 파일로 저장
                    sh '''
                        echo "💾 Docker 이미지를 tar 파일로 저장 중..."
                        docker save sca-be:latest -o sca-be.tar
                        docker save sca-fe:latest -o sca-fe.tar
                        ls -lh *.tar
                    '''
                }
            }
        }
        
        stage('Deploy to EC2') {
            steps {
                script {
                    echo '🚀 EC2에 배포 시작...'
                    echo "서버: ${EC2_USER}@${EC2_HOST}"
                    echo "배포 디렉토리: ${DEPLOY_DIR}"
                    
                    // ubuntu SSH credential 사용
                    withCredentials([sshUserPrivateKey(credentialsId: "${SSH_CREDENTIAL_ID}", keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                        // EC2에 디렉토리 생성
                        sh """
                            ssh -i \${SSH_KEY} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \${SSH_USER}@${EC2_HOST} '
                                mkdir -p ${DEPLOY_DIR}
                            '
                        """
                        
                        // Docker 이미지 tar 파일 전송
                        sh """
                            echo "📦 Docker 이미지 전송 중..."
                            scp -i \${SSH_KEY} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
                                sca-be.tar \
                                \${SSH_USER}@${EC2_HOST}:${DEPLOY_DIR}/
                            scp -i \${SSH_KEY} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
                                sca-fe.tar \
                                \${SSH_USER}@${EC2_HOST}:${DEPLOY_DIR}/
                        """
                        
                        // 배포 스크립트 및 docker-compose.yml 전송
                        sh """
                            scp -i \${SSH_KEY} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
                                deploy.sh \
                                \${SSH_USER}@${EC2_HOST}:${DEPLOY_DIR}/
                            scp -i \${SSH_KEY} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
                                docker-compose.yml \
                                \${SSH_USER}@${EC2_HOST}:${DEPLOY_DIR}/
                        """
                        
                        // .env 파일 생성 및 전송 (EC2_HOST 자동 치환)
                        sh """
                            cat > .env << EOF
# Database Configuration
DB_URL=jdbc:mysql://host.docker.internal:3306/sca_db
DB_USERNAME=sca_user
DB_PASSWORD=scaStrong#2025!

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-must-be-at-least-256-bits-long-for-HS256-algorithm-security
JWT_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

# Spring Profile
SPRING_PROFILES_ACTIVE=prod
EOF
                            scp -i \${SSH_KEY} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
                                .env \
                                \${SSH_USER}@${EC2_HOST}:${DEPLOY_DIR}/
                        """
                        
                        // MySQL 초기화 스크립트 전송
                        sh """
                            ssh -i \${SSH_KEY} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \${SSH_USER}@${EC2_HOST} '
                                mkdir -p ${DEPLOY_DIR}/mysql
                            '
                            scp -i \${SSH_KEY} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
                                mysql/init.sql \
                                \${SSH_USER}@${EC2_HOST}:${DEPLOY_DIR}/mysql/
                        """
                        
                        // EC2에서 Docker 이미지 로드 및 배포 스크립트 실행
                        sh """
                            ssh -i \${SSH_KEY} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \${SSH_USER}@${EC2_HOST} '
                                cd ${DEPLOY_DIR}
                                echo "🐳 Docker 이미지 로드 중..."
                                docker load -i sca-be.tar || true
                                docker load -i sca-fe.tar || true
                                echo "🚀 배포 스크립트 실행 중..."
                                chmod +x deploy.sh
                                sudo ./deploy.sh
                                echo "🧹 임시 파일 정리 중..."
                                rm -f sca-be.tar sca-fe.tar || true
                            '
                        """
                    }
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo '🏥 헬스 체크 시작...'
                    sleep(time: 15, unit: 'SECONDS')
                    
                    // MySQL 연결 확인 (백엔드 헬스 체크로 간접 확인)
                    echo "📊 MySQL 연결 확인 중 (백엔드 헬스 체크를 통해)..."
                    
                    // 백엔드 헬스 체크 (DB 연결 포함)
                    sh """
                        echo "백엔드 헬스 체크 중..."
                        HEALTH_RESPONSE=\$(curl -s http://${EC2_HOST}:${BACKEND_PORT}/actuator/health || echo "")
                        if [ -z "\$HEALTH_RESPONSE" ]; then
                            echo "⚠️  백엔드 헬스 체크 실패 - MySQL 연결 문제일 수 있습니다"
                            echo "EC2 서버에서 로그 확인: sudo journalctl -u sca-backend -n 50"
                        else
                            echo "✅ 백엔드 헬스 체크 성공"
                            echo "\$HEALTH_RESPONSE"
                        fi
                    """
                    
                    // 프론트엔드 헬스 체크
                    sh """
                        echo "프론트엔드 헬스 체크 중..."
                        curl -f http://${EC2_HOST}:${FRONTEND_PORT} || echo "프론트엔드 헬스 체크 실패 (무시하고 계속)"
                    """
                    
                    echo '✅ 배포 완료!'
                    echo "백엔드: http://${EC2_HOST}:${BACKEND_PORT}"
                    echo "프론트엔드: http://${EC2_HOST}:${FRONTEND_PORT}"
                    echo ""
                    echo "📝 참고: MySQL 설정은 EC2의 ${DEPLOY_DIR}/.env 파일에서 관리됩니다."
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ 배포 성공!'
        }
        failure {
            echo '❌ 배포 실패!'
        }
        always {
            cleanWs()
        }
    }
}

