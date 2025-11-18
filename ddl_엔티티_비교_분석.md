# DDL SQL vs 엔티티 비교 분석

## 🔍 주요 차이점

### 1. ❌ **quests 테이블 - 누락된 필드**

**ddl.sql에 없음:**
- `deadline` (DATETIME) - 퀘스트 마감일
- `difficulty` (INT) - 퀘스트 난이도 (1-5)

**엔티티에 있음:**
```java
@Column(name = "deadline")
private LocalDateTime deadline;

@Column(name = "difficulty")
private Integer difficulty;
```

**수정 필요:** ddl.sql에 추가 필요

---

### 2. ❌ **raids 테이블 - 누락된 필드**

**ddl.sql에 없음:**
- `raid_name` (VARCHAR(120)) - 레이드 이름

**엔티티에 있음:**
```java
@Column(name = "raid_name", nullable = false, length = 120)
private String raidName;
```

**수정 필요:** ddl.sql에 추가 필요

---

### 3. ❌ **raids 테이블 - 누락된 필드**

**ddl.sql에 없음:**
- `reward_research_data` (INT) - 탐사데이터 보상

**엔티티 확인 필요:** 엔티티에는 없지만 사용될 수 있음

---

### 4. ❌ **raid_logs 테이블 - 완전히 누락**

**ddl.sql에 없음:** `raid_logs` 테이블 자체가 없음

**엔티티에 있음:**
```java
@Entity
@Table(name = "raid_logs")
public class RaidLog extends BaseTimeEntity {
    @Column(name = "raid_log_id")
    private Long raidLogId;
    
    @Column(name = "log_type", length = 40, nullable = false)
    private RaidLogType logType;
    
    @Column(name = "damage_amount")
    private Integer damageAmount;
    
    @Column(name = "research_data_used")
    private Integer researchDataUsed;
    
    @Column(name = "remaining_boss_hp")
    private Long remainingBossHp;
    
    @Column(name = "message", length = 255)
    private String message;
}
```

**수정 필요:** ddl.sql에 테이블 추가 필요

---

### 5. ⚠️ **contributions 테이블 - 필드명 차이**

**ddl.sql:**
- `updated_at` (DATETIME)

**엔티티:**
- BaseTimeEntity 상속 안 함
- `updated_at` 필드 없음

**확인 필요:** 엔티티에 `last_attack_at` 같은 필드가 있는지 확인

---

### 6. ✅ **quest_assignments 테이블 - ENUM 차이**

**ddl.sql:**
```sql
status ENUM('ASSIGNED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'EXPIRED')
```

**엔티티:**
- QuestStatus enum 사용 (동일한 값들)

**상태:** 일치함

---

### 7. ✅ **raids 테이블 - ENUM 차이**

**ddl.sql:**
```sql
status VARCHAR(20)
difficulty ENUM('LOW', 'MEDIUM', 'HIGH')
boss_type ENUM('ZELUS_INDUSTRY', 'KRAKEN')
```

**엔티티:**
- RaidStatus enum 사용
- Difficulty enum 사용
- RaidTemplate enum 사용

**확인 필요:** enum 값들이 일치하는지 확인

---

## 📋 수정된 DDL SQL 필요 사항

### 추가해야 할 필드:

1. **quests 테이블:**
```sql
ALTER TABLE quests 
ADD COLUMN deadline DATETIME,
ADD COLUMN difficulty INT;
```

2. **raids 테이블:**
```sql
ALTER TABLE raids 
ADD COLUMN raid_name VARCHAR(120) NOT NULL AFTER raid_id,
ADD COLUMN reward_research_data INT DEFAULT 0;
```

3. **raid_logs 테이블 (새로 생성):**
```sql
CREATE TABLE raid_logs (
  raid_log_id BIGINT NOT NULL AUTO_INCREMENT,
  raid_id INT,
  student_id INT,
  log_type VARCHAR(40) NOT NULL,
  damage_amount INT,
  research_data_used INT,
  remaining_boss_hp BIGINT,
  message VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (raid_log_id),
  FOREIGN KEY (raid_id) REFERENCES raids (raid_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE SET NULL,
  INDEX IDX_RAID_LOGS_RAID_ID (raid_id),
  INDEX IDX_RAID_LOGS_STUDENT_ID (student_id)
);
```

---

## ✅ 일치하는 테이블

- ✅ members
- ✅ students
- ✅ teachers
- ✅ classes
- ✅ quest_assignments
- ✅ submissions
- ✅ group_quests
- ✅ group_quest_progress
- ✅ contributions (필드명 차이 있음)
- ✅ fish
- ✅ collections
- ✅ collection_entries
- ✅ notice
- ✅ action_logs

---

## 🔧 수정된 DDL SQL 생성 필요

위의 차이점을 반영한 완전한 DDL SQL 파일을 생성해야 합니다.

