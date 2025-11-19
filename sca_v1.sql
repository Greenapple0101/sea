-- FK 제약 조건 임시 비활성화
SET FOREIGN_KEY_CHECKS = 0;

-- ---
-- 테이블 생성
-- ---

-- members (회원)
DROP TABLE IF EXISTS members;
CREATE TABLE members (
  member_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  username VARCHAR(50) NOT NULL, -- 아이디
  password VARCHAR(255) NOT NULL, -- 비밀번호
  real_name VARCHAR(50) NOT NULL, -- 실명
  nickname VARCHAR(50) NOT NULL, -- 닉네임
  email VARCHAR(100) NOT NULL, -- 이메일
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 생성일
  role ENUM('TEACHER', 'STUDENT') NOT NULL, -- 역할
  PRIMARY KEY (member_id),
  UNIQUE KEY UK_USERNAME (username),
  UNIQUE KEY UK_NICKNAME (nickname),
  UNIQUE KEY UK_EMAIL (email)
);

-- teachers (교사)
DROP TABLE IF EXISTS teachers;
CREATE TABLE teachers (
  member_id INT NOT NULL, -- Primary Key
  PRIMARY KEY (member_id)
);

-- students (학생)
DROP TABLE IF EXISTS students;
CREATE TABLE students (
  member_id INT NOT NULL, -- Primary Key
  class_id INT, -- 학급 id
  coral INT NOT NULL DEFAULT 0, -- 재화1
  research_data INT NOT NULL DEFAULT 0, -- 재화2
  correction_factor FLOAT NOT NULL DEFAULT 1.0, -- 보정계수
  PRIMARY KEY (member_id)
);

-- classes (학급)
DROP TABLE IF EXISTS classes;
CREATE TABLE classes (
  class_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  teacher_id INT, -- 교사 id
  class_name VARCHAR(100) NOT NULL, -- 학급이름
  invite_code VARCHAR(20) NOT NULL, -- 초대코드
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 생성일
  grade VARCHAR(20), -- 학년
  subject VARCHAR(20), -- 과목
  description VARCHAR(100), -- 반 설명
  PRIMARY KEY (class_id),
  UNIQUE KEY UK_INVITE_CODE (invite_code)
);

-- quests (퀘스트)
DROP TABLE IF EXISTS quests;
CREATE TABLE quests (
  quest_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  teacher_id INT, -- 교사 id
  title VARCHAR(255) NOT NULL, -- 제목
  teacher_content TINYTEXT, -- 내용 (백엔드 @Lob 어노테이션과 일치)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 생성일
  reward_coral_default INT DEFAULT 0, -- 코랄 보상
  reward_research_data_default INT DEFAULT 0, -- 탐사데이터 보상
  deadline DATETIME, -- 마감일 (추가)
  difficulty INT, -- 난이도 (1-5) (추가)
  PRIMARY KEY (quest_id)
);

-- quest_assignments (퀘스트 할당)
DROP TABLE IF EXISTS quest_assignments;
CREATE TABLE quest_assignments (
  assignment_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  quest_id INT, -- FK to quests.quest_id
  student_id INT, -- FK to students.member_id
  reward_coral_personal INT DEFAULT 0, -- 코랄 보상
  reward_research_data_personal INT DEFAULT 0, -- 탐사데이터 보상
  status ENUM('ASSIGNED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'EXPIRED'), -- 상태
  PRIMARY KEY (assignment_id)
);

-- submissions (퀘스트 결과)
DROP TABLE IF EXISTS submissions;
CREATE TABLE submissions (
  submission_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  assignment_id INT, -- 퀘스트 할당 id
  attachment_url VARCHAR(255), -- 첨부파일 경로
  student_content TINYTEXT, -- 학생 제출 내용 (백엔드 @Lob 어노테이션과 일치)
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 제출시각
  comment TINYTEXT, -- 선생님 코멘트 (백엔드 @Lob 어노테이션과 일치)
  PRIMARY KEY (submission_id)
);

-- group_quests (단체퀘스트)
DROP TABLE IF EXISTS group_quests;
CREATE TABLE group_quests (
  group_quest_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  teacher_id INT, -- 교사 id
  class_id INT, -- 학급 id
  title VARCHAR(255) NOT NULL, -- 제목
  reward_coral INT DEFAULT 0, -- 코랄 보상
  reward_research_data INT DEFAULT 0, -- 탐사데이터 보상
  end_date DATETIME, -- 퀘스트 마감일
  status ENUM('ACTIVE', 'COMPLETED', 'FAILED'), -- 상태
  content TINYTEXT, -- 내용 (백엔드 @Lob 어노테이션과 일치)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 생성일
  type ENUM('ATTENDANCE', 'ASSIGNMENT', 'PARTICIPATION', 'EXAM', 'OTHER'),
  PRIMARY KEY (group_quest_id)
);

-- group_quest_progress (단체 퀘스트 학생별 진행 상황)
DROP TABLE IF EXISTS group_quest_progress;
CREATE TABLE group_quest_progress (
  progress_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  group_quest_id INT, -- 단체 퀘스트 id
  student_id INT, -- 학생 id
  is_completed BOOLEAN, -- 해당 학생의 완료 여부
  completed_at DATETIME DEFAULT NULL, -- 학생 완료/체크 시각
  PRIMARY KEY (progress_id),
  UNIQUE KEY UK_GROUP_QUEST_STUDENT (group_quest_id, student_id)
);

-- raids (레이드)
DROP TABLE IF EXISTS raids;
CREATE TABLE raids (
  raid_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  raid_name VARCHAR(120) NOT NULL, -- 레이드 이름 (추가)
  teacher_id INT, -- 교사 id
  class_id INT, -- 학급 id
  start_date DATETIME, -- 시작일
  end_date DATETIME, -- 종료일
  total_boss_hp BIGINT, -- 총 보스 HP
  current_boss_hp BIGINT, -- 현재 보스 HP
  reward_coral INT DEFAULT 0, -- 코랄 보상
  special_reward_description TINYTEXT, -- 보상 정보 (백엔드 @Lob 어노테이션과 일치)
  status VARCHAR(20), -- 진행상황 (ENUM: ACTIVE, COMPLETED, EXPIRED, TERMINATED)
  difficulty ENUM('LOW', 'MEDIUM', 'HIGH'), -- 난이도
  boss_type ENUM('ZELUS_INDUSTRY', 'KRAKEN'),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 생성일 (BaseTimeEntity)
  PRIMARY KEY (raid_id)
);

-- contributions (기여도)
DROP TABLE IF EXISTS contributions;
CREATE TABLE contributions (
  contribution_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  raid_id INT, -- 레이드 id
  student_id INT, -- 학생 id
  damage INT NOT NULL DEFAULT 0, -- 대미지
  PRIMARY KEY (contribution_id),
  UNIQUE KEY UK_RAID_STUDENT (raid_id, student_id)
);

-- raid_logs (레이드 로그) - 새로 추가
DROP TABLE IF EXISTS raid_logs;
CREATE TABLE raid_logs (
  raid_log_id BIGINT NOT NULL AUTO_INCREMENT, -- Primary Key
  raid_id INT NOT NULL, -- 레이드 id
  student_id INT, -- 학생 id
  log_type VARCHAR(40) NOT NULL, -- 로그 타입 (ENUM: ATTACK_LOG, RAID_COMPLETED, RAID_TERMINATED, RAID_EXPIRED)
  damage_amount INT, -- 대미지
  research_data_used INT, -- 사용한 탐사데이터
  remaining_boss_hp BIGINT, -- 남은 보스 HP
  message VARCHAR(255), -- 메시지
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 생성일
  PRIMARY KEY (raid_log_id)
);

-- fish (물고기 마스터 데이터)
DROP TABLE IF EXISTS fish;
CREATE TABLE fish (
  fish_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  fish_name VARCHAR(100) NOT NULL, -- 물고기 이름
  grade VARCHAR(20), -- 등급 (ENUM: COMMON, RARE, LEGENDARY)
  probability FLOAT, -- 확률
  PRIMARY KEY (fish_id)
);

-- collections (학생 개인 도감)
DROP TABLE IF EXISTS collections;
CREATE TABLE collections (
  collection_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  student_id INT NOT NULL, -- 학생 id
  PRIMARY KEY (collection_id),
  UNIQUE KEY UK_COLLECTIONS_STUDENT_ID (student_id)
);

-- collection_entries (도감 수집 내역)
DROP TABLE IF EXISTS collection_entries;
CREATE TABLE collection_entries (
  entry_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  collection_id INT, -- 학생 개인 도감 id
  fish_id INT, -- 물고기 마스터 데이터 id
  fish_count INT NOT NULL DEFAULT 1, -- 물고기 개수
  PRIMARY KEY (entry_id),
  UNIQUE KEY UK_COLLECTION_FISH (collection_id, fish_id)
);

-- notice (공지)
DROP TABLE IF EXISTS notice;
CREATE TABLE notice (
  notice_id BIGINT NOT NULL AUTO_INCREMENT, -- Primary Key
  notice_type VARCHAR(50), -- 공지 종류
  student_id INT, -- 학생 id
  assignment_id INT, -- 퀘스트 할당 id
  group_quest_id INT, -- 단체 퀘스트 id
  raid_id INT, -- 레이드 id
  title VARCHAR(255), -- 공지 메시지
  content VARCHAR(255), -- 내용
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 공지 등록 시간
  PRIMARY KEY (notice_id)
);

-- action_logs (주요 활동 로그)
DROP TABLE IF EXISTS action_logs;
CREATE TABLE action_logs (
  log_id BIGINT NOT NULL AUTO_INCREMENT, -- Primary Key
  student_id INT, -- 학생 id
  action_type VARCHAR(50), -- 활동 종류
  assignment_id INT, -- 퀘스트 할당 id
  group_quest_id INT, -- 단체 퀘스트 id
  raid_id INT, -- 레이드 id
  change_coral INT, -- 코랄 변화량
  change_research INT, -- 탐사데이터 변화량
  reference_id INT, -- 참조 ID
  log_message VARCHAR(255), -- 로그 메시지
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 활동 발생 시간
  PRIMARY KEY (log_id)
);

-- ---
-- 외래 키 및 인덱스 추가
-- ---

-- teachers
ALTER TABLE teachers
  ADD CONSTRAINT FK_TEACHERS_MEMBERS FOREIGN KEY (member_id) REFERENCES members (member_id) ON DELETE CASCADE;

-- students
ALTER TABLE students
  ADD CONSTRAINT FK_STUDENTS_MEMBERS FOREIGN KEY (member_id) REFERENCES members (member_id) ON DELETE CASCADE,
  ADD CONSTRAINT FK_STUDENTS_CLASSES FOREIGN KEY (class_id) REFERENCES classes (class_id) ON DELETE SET NULL,
  ADD INDEX IDX_STUDENTS_CLASS_ID (class_id);

-- classes
ALTER TABLE classes
  ADD CONSTRAINT FK_CLASSES_TEACHERS FOREIGN KEY (teacher_id) REFERENCES teachers (member_id) ON DELETE SET NULL,
  ADD INDEX IDX_CLASSES_TEACHER_ID (teacher_id);

-- quests
ALTER TABLE quests
  ADD CONSTRAINT FK_QUESTS_TEACHERS FOREIGN KEY (teacher_id) REFERENCES teachers (member_id) ON DELETE SET NULL;

-- quest_assignments
ALTER TABLE quest_assignments
  ADD CONSTRAINT FK_ASSIGNMENTS_QUESTS FOREIGN KEY (quest_id) REFERENCES quests (quest_id) ON DELETE CASCADE,
  ADD CONSTRAINT FK_ASSIGNMENTS_STUDENTS FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE CASCADE,
  ADD INDEX IDX_ASSIGNMENTS_QUEST_ID (quest_id),
  ADD INDEX IDX_ASSIGNMENTS_STUDENT_ID (student_id),
  ADD INDEX IDX_ASSIGNMENTS_STATUS (status);

-- submissions
ALTER TABLE submissions
  ADD CONSTRAINT FK_SUBMISSIONS_ASSIGNMENTS FOREIGN KEY (assignment_id) REFERENCES quest_assignments (assignment_id) ON DELETE CASCADE,
  ADD INDEX IDX_SUBMISSIONS_SUBMITTED_AT (submitted_at);

-- group_quests
ALTER TABLE group_quests
  ADD CONSTRAINT FK_GROUP_QUESTS_TEACHERS FOREIGN KEY (teacher_id) REFERENCES teachers (member_id) ON DELETE SET NULL,
  ADD CONSTRAINT FK_GROUP_QUESTS_CLASSES FOREIGN KEY (class_id) REFERENCES classes (class_id) ON DELETE SET NULL,
  ADD INDEX IDX_GROUP_QUESTS_TEACHER_ID (teacher_id),
  ADD INDEX IDX_GROUP_QUESTS_CLASS_ID (class_id);

-- group_quest_progress
ALTER TABLE group_quest_progress
  ADD CONSTRAINT FK_PROGRESS_GROUP_QUESTS FOREIGN KEY (group_quest_id) REFERENCES group_quests (group_quest_id) ON DELETE CASCADE,
  ADD CONSTRAINT FK_PROGRESS_STUDENTS FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE CASCADE,
  ADD INDEX IDX_PROGRESS_STUDENT_ID (student_id);

-- raids
ALTER TABLE raids
  ADD CONSTRAINT FK_RAIDS_TEACHERS FOREIGN KEY (teacher_id) REFERENCES teachers (member_id) ON DELETE SET NULL,
  ADD CONSTRAINT FK_RAIDS_CLASSES FOREIGN KEY (class_id) REFERENCES classes (class_id) ON DELETE SET NULL,
  ADD INDEX IDX_RAIDS_CLASS_ID (class_id);

-- contributions
ALTER TABLE contributions
  ADD CONSTRAINT FK_CONTRIBUTIONS_RAIDS FOREIGN KEY (raid_id) REFERENCES raids (raid_id) ON DELETE CASCADE,
  ADD CONSTRAINT FK_CONTRIBUTIONS_STUDENTS FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE CASCADE,
  ADD INDEX IDX_CONTRIBUTIONS_STUDENT_ID (student_id);

-- raid_logs (새로 추가)
ALTER TABLE raid_logs
  ADD CONSTRAINT FK_RAID_LOGS_RAIDS FOREIGN KEY (raid_id) REFERENCES raids (raid_id) ON DELETE CASCADE,
  ADD CONSTRAINT FK_RAID_LOGS_STUDENTS FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE SET NULL,
  ADD INDEX IDX_RAID_LOGS_RAID_ID (raid_id),
  ADD INDEX IDX_RAID_LOGS_STUDENT_ID (student_id);

-- fish
ALTER TABLE fish
  ADD INDEX IDX_FISH_GRADE (grade);

-- collections
ALTER TABLE collections
  ADD CONSTRAINT FK_COLLECTIONS_STUDENTS FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE CASCADE;

-- collection_entries
ALTER TABLE collection_entries
  ADD CONSTRAINT FK_ENTRIES_COLLECTIONS FOREIGN KEY (collection_id) REFERENCES collections (collection_id) ON DELETE CASCADE,
  ADD CONSTRAINT FK_ENTRIES_FISH FOREIGN KEY (fish_id) REFERENCES fish (fish_id) ON DELETE RESTRICT;

-- notice
ALTER TABLE notice
  ADD CONSTRAINT FK_NOTICE_STUDENTS FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE SET NULL,
  ADD CONSTRAINT FK_NOTICE_ASSIGNMENTS FOREIGN KEY (assignment_id) REFERENCES quest_assignments (assignment_id) ON DELETE SET NULL,
  ADD CONSTRAINT FK_NOTICE_GROUP_QUESTS FOREIGN KEY (group_quest_id) REFERENCES group_quests (group_quest_id) ON DELETE SET NULL,
  ADD CONSTRAINT FK_NOTICE_RAIDS FOREIGN KEY (raid_id) REFERENCES raids (raid_id) ON DELETE SET NULL,
  ADD INDEX IDX_NOTICE_STUDIDENT_CREATED (student_id, created_at DESC),
  ADD INDEX IDX_NOTICE_TYPE (notice_type);

-- action_logs
ALTER TABLE action_logs
  ADD CONSTRAINT FK_LOGS_STUDENTS FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE SET NULL,
  ADD CONSTRAINT FK_LOGS_ASSIGNMENTS FOREIGN KEY (assignment_id) REFERENCES quest_assignments (assignment_id) ON DELETE SET NULL,
  ADD CONSTRAINT FK_LOGS_GROUP_QUESTS FOREIGN KEY (group_quest_id) REFERENCES group_quests (group_quest_id) ON DELETE SET NULL,
  ADD CONSTRAINT FK_LOGS_RAIDS FOREIGN KEY (raid_id) REFERENCES raids (raid_id) ON DELETE SET NULL,
  ADD INDEX IDX_LOGS_STUDENT_CREATED (student_id, created_at DESC),
  ADD INDEX IDX_LOGS_ACTION_TYPE (action_type);

-- FK 제약 조건 다시 활성화
SET FOREIGN_KEY_CHECKS = 1;

