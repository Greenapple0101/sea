# GitHub Webhook 자동 빌드 설정 가이드

## ✅ 전체 흐름

**GitHub에 push → GitHub Webhook → Jenkins → 자동 빌드**

---

## 🔥 1) Jenkins 쪽 준비

### ✔ A. Jenkins Job 설정

1. Jenkins → **새로운 Item** 클릭
2. **Pipeline** 선택
3. Job 이름 입력 (예: `sca-deploy`)
4. **OK** 클릭

### ✔ B. Pipeline 설정

**Pipeline** 섹션:
- **Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: `https://github.com/Greenapple0101/sea.git`
- **Credentials**: GitHub credential (필요시)
- **Branches to build**: `*/main`
- **Script Path**: `Jenkinsfile`

### ✔ C. Build Triggers 설정 (중요!)

**Build Triggers** 탭에서:
- ✅ **GitHub hook trigger for GITScm polling** 체크

이게 **가장 중요**합니다!

### ✔ D. GitHub Credentials 설정 (필요시)

Jenkins → **Manage Jenkins** → **Credentials** → **System** → **Global credentials**

- **Add Credentials** 클릭
- **Kind**: Username with password
- **Username**: GitHub 사용자명
- **Password**: GitHub Personal Access Token (PAT)
- **ID**: `github`
- **Description**: GitHub 저장소 접근용

> **GitHub PAT 생성 방법:**
> 1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
> 2. Generate new token (classic)
> 3. 권한: `repo` 체크
> 4. Generate token
> 5. 토큰 복사 (한 번만 보임!)

---

## 🔥 2) GitHub 저장소 설정

### ✔ A. Webhook 추가

1. GitHub 저장소 → **Settings** → **Webhooks**
2. **Add webhook** 클릭

### ✔ B. Webhook 설정

**Payload URL:**
```
http://<JENKINS_PUBLIC_IP>:8080/github-webhook/
```

예시:
```
http://3.27.78.93:8080/github-webhook/
```

⚠️ **주의**: 뒤에 `/github-webhook/` 꼭 붙여야 함!

**Content type:**
- `application/json` (기본값)

**Secret:**
- 비워두거나, Jenkins와 GitHub 간 보안을 위해 Secret 설정 가능

**Which events would you like to trigger this webhook?**
- ✅ **Just the push event** (권장)
- 또는 **Let me select individual events**:
  - ✅ Push
  - ✅ Pull request (선택사항)

**Active:**
- ✅ 체크

**Add webhook** 클릭

---

## 🔥 3) GitHub Webhook 테스트

### ✔ A. Webhook 테스트

GitHub Webhook 설정 화면에서:
- **Recent Deliveries** 섹션 확인
- **Redelivery** 버튼 클릭하여 테스트

### ✔ B. 성공 확인

성공하면:
- ✅ **Status**: `200 OK`
- Jenkins 콘솔에 다음과 같은 로그가 찍힘:
  ```
  Received POST from GitHub
  Triggering sca-deploy
  ```

그리고 Jenkins Job이 자동으로 빌드 시작됨!

---

## 🔥 4) Jenkins 방화벽 / 보안그룹 설정

### AWS EC2 Security Group 설정

**인바운드 규칙 추가:**
- **Type**: Custom TCP
- **Port**: 8080
- **Source**: `0.0.0.0/0` (또는 GitHub IP range)

> **GitHub IP Range (선택사항):**
> - 더 보안을 강화하려면 GitHub IP만 허용
> - https://api.github.com/meta 에서 IP 확인

---

## 🔥 5) 테스트 방법

### 방법 1: GitHub에서 직접 테스트
1. 코드 수정
2. Git commit & push
3. Jenkins에서 자동 빌드 시작 확인

### 방법 2: Webhook Redelivery
1. GitHub → Settings → Webhooks
2. Webhook 클릭
3. **Recent Deliveries** → **Redelivery** 클릭

---

## 🔥 6) Jenkinsfile 확인

현재 Jenkinsfile에는 이미 다음이 포함되어 있습니다:

```groovy
triggers {
    githubPush()
}
```

이 설정으로 GitHub push 시 자동 빌드가 트리거됩니다.

---

## ✅ 요약 (초초간단)

### Jenkins:
1. ✅ **Build Triggers** → **GitHub hook trigger for GITScm polling** 체크
2. ✅ Public IP:8080/github-webhook/ 열어두기 (보안그룹)

### GitHub:
1. ✅ **Settings** → **Webhooks** → **Add webhook**
2. ✅ URL: `http://<JENKINS_IP>:8080/github-webhook/`
3. ✅ **Just the push event** 선택

### 결과:
- ✅ GitHub에 push → 자동으로 Jenkins 빌드 시작!

---

## 🔍 문제 해결

### Webhook이 작동하지 않을 때

1. **Jenkins 로그 확인**
   - Jenkins → **Manage Jenkins** → **System Log**
   - `github-webhook` 관련 로그 확인

2. **보안그룹 확인**
   - EC2 Security Group에서 포트 8080이 열려있는지 확인

3. **Jenkins 플러그인 확인**
   - **Manage Jenkins** → **Plugins**
   - **GitHub plugin** 설치 확인

4. **Webhook URL 확인**
   - URL 끝에 `/github-webhook/` 있는지 확인
   - HTTP vs HTTPS 확인

5. **GitHub Webhook Deliveries 확인**
   - GitHub → Settings → Webhooks → Webhook 클릭
   - **Recent Deliveries**에서 에러 메시지 확인

---

## 🚀 완료!

이제 GitHub에 push하면 자동으로 Jenkins 빌드가 시작됩니다!

```bash
git add .
git commit -m "테스트 커밋"
git push origin main
```

→ Jenkins에서 자동 빌드 시작 확인! 🎉

