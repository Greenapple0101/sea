# Jenkins Credentials 설정 가이드

## 📋 현재 필요한 Credentials

### ✅ 이미 설정된 Credentials
1. **`ubuntu`** (SSH Username with private key)
   - EC2 SSH 접속용
   - Username: ubuntu
   - Private Key: EC2 키 페어 파일

2. **`github`** (Username with password)
   - Git 저장소 접근용 (선택사항, SCM 설정에서 사용)

## 🔧 Jenkinsfile 사용 방법

### 빌드 파라미터 설정
Jenkins Job을 실행할 때 다음 파라미터를 입력해야 합니다:

- **EC2_HOST**: EC2 퍼블릭 IP 또는 도메인
  - 예: `3.27.78.93`
  - 예: `ec2-xxx-xxx-xxx-xxx.ap-northeast-2.compute.amazonaws.com`

### 빌드 실행 방법
1. Jenkins Job 페이지에서 **Build with Parameters** 클릭
2. **EC2_HOST** 필드에 EC2 퍼블릭 IP 또는 도메인 입력
3. **Build** 클릭

## 💡 EC2_HOST를 Credential로 관리하고 싶다면

### 방법 1: Secret text Credential 추가 (권장)
1. Jenkins → **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
2. **Add Credentials** 클릭
3. 설정:
   - **Kind**: Secret text
   - **Secret**: EC2 퍼블릭 IP 또는 도메인 (예: `3.27.78.93`)
   - **ID**: `ec2-host`
   - **Description**: EC2 호스트 주소
4. **OK** 클릭

그리고 Jenkinsfile을 다음과 같이 수정:
```groovy
environment {
    EC2_HOST = credentials('ec2-host')
}
```

### 방법 2: 현재 방식 유지 (파라미터 사용)
- 빌드할 때마다 EC2_HOST를 입력
- 유연하지만 매번 입력 필요

## ✅ 확인 사항

- [x] `ubuntu` credential 설정 완료
- [ ] EC2_HOST 파라미터 입력 (또는 credential 추가)
- [ ] Jenkins Job에서 "Build with Parameters" 활성화 확인

## 🚀 배포 프로세스

1. Git 저장소 체크아웃 (SCM 설정 사용)
2. 백엔드 빌드 (`백/` 폴더)
3. 프론트엔드 빌드 (`프론트/` 폴더)
4. EC2 배포 (`ubuntu` credential 사용)
5. 헬스 체크

