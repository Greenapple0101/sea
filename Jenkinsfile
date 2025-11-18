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
        // 애플리케이션 정보 (GitHub repo 실제 구조: 백, 프론트)
        BACKEND_DIR = '백'
        FRONTEND_DIR = '프론트'
        DEPLOY_DIR = '/home/ubuntu/sca'
        
        // EC2 서버 정보
        EC2_HOST = '3.27.78.93'
        EC2_USER = 'ubuntu'
        SSH_CREDENTIAL_ID = 'ubuntu'
        
        // 포트 정보
        BACKEND_PORT = '8080'
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
                                mkdir -p ${DEPLOY_DIR}/{backend,frontend}
                                mkdir -p ${DEPLOY_DIR}/backend/logs
                            '
                        """
                        
                        // 백엔드 JAR 파일 전송 (plain jar 제외, 실행 가능한 jar만)
                        sh """
                            JAR_FILE=\$(find ${BACKEND_DIR}/build/libs -name "*-SNAPSHOT.jar" ! -name "*-plain.jar" | head -1)
                            if [ -z "\$JAR_FILE" ]; then
                                echo "❌ JAR 파일을 찾을 수 없습니다."
                                exit 1
                            fi
                            scp -i \${SSH_KEY} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
                                \$JAR_FILE \
                                \${SSH_USER}@${EC2_HOST}:${DEPLOY_DIR}/backend/sca-be.jar
                        """
                        
                        // 프론트엔드 빌드 파일 전송
                        sh """
                            rsync -avz -e "ssh -i \${SSH_KEY} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
                                --delete \
                                ${FRONTEND_DIR}/build/ \
                                \${SSH_USER}@${EC2_HOST}:${DEPLOY_DIR}/frontend/
                        """
                        
                        // 배포 스크립트 및 설정 파일 전송 (.env는 이미 서버에 있으므로 전송하지 않음)
                        sh """
                            scp -i \${SSH_KEY} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
                                deploy.sh \
                                \${SSH_USER}@${EC2_HOST}:${DEPLOY_DIR}/
                            scp -i \${SSH_KEY} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
                                sca-backend.service \
                                \${SSH_USER}@${EC2_HOST}:${DEPLOY_DIR}/
                            scp -i \${SSH_KEY} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
                                nginx-sca.conf \
                                \${SSH_USER}@${EC2_HOST}:${DEPLOY_DIR}/
                        """
                        
                        // EC2에서 배포 스크립트 실행
                        sh """
                            ssh -i \${SSH_KEY} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \${SSH_USER}@${EC2_HOST} '
                                cd ${DEPLOY_DIR}
                                chmod +x deploy.sh
                                sudo ./deploy.sh
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

