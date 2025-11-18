# DDL SQL vs 엔티티 차이점 요약

## ❌ 발견된 차이점

### 1. **quests 테이블 - 누락된 필드 2개**

**추가 필요:**
- `deadline` DATETIME - 퀘스트 마감일
- `difficulty` INT - 퀘스트 난이도 (1-5)

**엔티티:**
```java
@Column(name = "deadline")
private LocalDateTime deadline;

@Column(name = "difficulty")
private Integer difficulty;
```

---

### 2. **raids 테이블 - 누락된 필드 2개**

**추가 필요:**
- `raid_name` VARCHAR(120) NOT NULL - 레이드 이름
- `reward_research_data` INT DEFAULT 0 - 탐사데이터 보상
- `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP - 생성일 (BaseTimeEntity)

**엔티티:**
```java
@Column(name = "raid_name", nullable = false, length = 120)
private String raidName;

// reward_research_data는 엔티티에 없지만 사용될 수 있음
```

---

### 3. **raid_logs 테이블 - 완전히 누락**

**새로 생성 필요:**
```sql
CREATE TABLE raid_logs (
  raid_log_id BIGINT NOT NULL AUTO_INCREMENT,
  raid_id INT NOT NULL,
  student_id INT,
  log_type VARCHAR(40) NOT NULL,
  damage_amount INT,
  research_data_used INT,
  remaining_boss_hp BIGINT,
  message VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (raid_log_id)
);
```

**엔티티:** RaidLog 엔티티 존재

---

### 4. **contributions 테이블 - 필드 차이**

**ddl.sql:**
- `updated_at` DATETIME

**엔티티:**
- BaseTimeEntity 상속 안 함
- `updated_at` 필드 없음

**결론:** ddl.sql에서 `updated_at` 제거 (엔티티와 일치)

---

### 5. **group_quest_progress 테이블 - UNIQUE 제약조건**

**ddl.sql:** UNIQUE 제약조건 없음

**엔티티:**
```java
@Table(name = "group_quest_progress",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"group_quest_id", "student_id"})
    }
)
```

**추가 필요:** UNIQUE KEY 추가

---

### 6. **contributions 테이블 - UNIQUE 제약조건**

**ddl.sql:** UNIQUE 제약조건 없음

**엔티티:**
```java
@Table(name = "contributions",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"raid_id", "student_id"})
    }
)
```

**추가 필요:** UNIQUE KEY 추가

---

## ✅ 수정 완료

`ddl_수정본.sql` 파일에 모든 차이점을 반영했습니다:

1. ✅ quests 테이블에 `deadline`, `difficulty` 추가
2. ✅ raids 테이블에 `raid_name`, `reward_research_data`, `created_at` 추가
3. ✅ raid_logs 테이블 새로 생성
4. ✅ contributions 테이블에서 `updated_at` 제거
5. ✅ group_quest_progress에 UNIQUE 제약조건 추가
6. ✅ contributions에 UNIQUE 제약조건 추가

---

## 🚀 사용 방법

1. 기존 데이터베이스가 있다면:
```sql
-- 기존 테이블에 필드 추가
ALTER TABLE quests ADD COLUMN deadline DATETIME;
ALTER TABLE quests ADD COLUMN difficulty INT;
ALTER TABLE raids ADD COLUMN raid_name VARCHAR(120) NOT NULL AFTER raid_id;
ALTER TABLE raids ADD COLUMN reward_research_data INT DEFAULT 0;
ALTER TABLE raids ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE contributions DROP COLUMN updated_at;
ALTER TABLE group_quest_progress ADD UNIQUE KEY UK_GROUP_QUEST_STUDENT (group_quest_id, student_id);
ALTER TABLE contributions ADD UNIQUE KEY UK_RAID_STUDENT (raid_id, student_id);

-- raid_logs 테이블 생성 (위의 ddl_수정본.sql 참고)
```

2. 새 데이터베이스라면:
```sql
-- ddl_수정본.sql 파일 전체 실행
source ddl_수정본.sql;
```

---

## ✅ 확인 사항

- [x] quests 테이블에 deadline, difficulty 추가
- [x] raids 테이블에 raid_name, reward_research_data, created_at 추가
- [x] raid_logs 테이블 생성
- [x] contributions 테이블 수정 (updated_at 제거, UNIQUE 추가)
- [x] group_quest_progress에 UNIQUE 제약조건 추가

