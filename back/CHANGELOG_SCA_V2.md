# SCA Backend 변경 요약 (sca_v2 기준)

## 신규/확장된 기능

### 1. 레이드 모듈
- `domain/raid` 패키지 일체 추가: Controller/Service/DTO/Entity/Repository/WebSocket 핸들러.
- 학생용 기능: `/api/v1/raids/my-raid`, 공격(주사위 보너스), 레이드 로그 조회.
- 교사용 기능: 레이드 생성/조회/종료, 반별 활성 레이드 검증.
- WebSocket 기반 실시간 로그 방송(`global/websocket`, `RaidWebSocketConfig`).

### 2. 가챠 & 물고기 관리
- Fish CRUD API(`FishController`, `FishService`)와 DTO 추가.
- `data.sql`에 샘플 물고기/도감 데이터 확장.

### 3. 학습 보정/AI 로그
- 학생 보정 계수(`students_factors`, `students_quest_factors`) 및 `ai_learning_logs` 도입.
- 관련 DTO/서비스에서 보정 정보를 읽어 사용하도록 수정.

### 4. 공통 인프라
- `SecurityConfig`, `ErrorCode`, `build.gradle` 등에서 레이드/보정/웹소켓에 필요한 권한 및 의존성 추가.
- S3 설정, WebSocket 설정 등 공용 Config 확장.

## 스키마 변경 (sca_v2.sql)

| 구분 | 주요 내용 |
| ---- | -------- |
| Soft Delete | `members`, `classes`, `quests`에 `deleted_at` 추가 |
| 학생 | `grade` 컬럼 및 보정 계수 테이블 신설 |
| 퀘스트 | `deadline`, `difficulty` ENUM 추가 |
| 레이드 | `raids`, `contributions`, `raid_logs`를 `sca_v1` 구조 기반으로 재구성 (템플릿/난이도/상태/보상/기여도 포함) |
| 기타 | `ai_learning_logs`, `collections`, `action_logs` 등 외래키/인덱스 재정비 |

## H2 개발 환경
- `schema-h2.sql` 추가: `sca_v2.sql`과 동일한 구조를 H2에 생성.
- `application-dev.yaml`을 `ddl-auto:none` + `schema-h2.sql`/`data.sql` 초기화 방식으로 변경.

## 참고
- GitHub 원격 dev 브랜치([PS-capstone/SCA-BE](https://github.com/PS-capstone/SCA-BE.git))에는 레이드/보정 기능이 포함되어 있지 않으므로, 필요한 경우 본 문서 내용을 참고해 기능별로 병합합니다.


