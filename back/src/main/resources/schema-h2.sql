SET REFERENTIAL_INTEGRITY FALSE;

-- ---
-- 테이블 생성
-- ---

-- members (회원)
DROP TABLE IF EXISTS members CASCADE;
CREATE TABLE members (
  member_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  username VARCHAR(50) NOT NULL, -- 아이디
  password VARCHAR(255) NOT NULL, -- 비밀번호
  real_name VARCHAR(50) NOT NULL, -- 실명
  nickname VARCHAR(50) NOT NULL, -- 닉네임
  email VARCHAR(100) NOT NULL, -- 이메일
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 생성일
  role ENUM('TEACHER', 'STUDENT') NOT NULL, -- 역할
  deleted_at DATETIME DEFAULT NULL, -- Soft Delete
  PRIMARY KEY (member_id),
  UNIQUE KEY UK_USERNAME (username),
  UNIQUE KEY UK_NICKNAME (nickname),
  UNIQUE KEY UK_EMAIL (email)
);

-- teachers (교사)
DROP TABLE IF EXISTS teachers CASCADE;
CREATE TABLE teachers (
  member_id INT NOT NULL, -- Primary Key
  PRIMARY KEY (member_id)
);

-- students (학생)
DROP TABLE IF EXISTS students CASCADE;
CREATE TABLE students (
  member_id INT NOT NULL, -- Primary Key
  class_id INT, -- 학급 id
  coral INT NOT NULL DEFAULT 0, -- 재화1
  research_data INT NOT NULL DEFAULT 0, -- 재화2
  grade FLOAT DEFAULT 0, -- 학생 성적
  PRIMARY KEY (member_id)
);

-- students_factors (학생 보정계수 - 전역)
DROP TABLE IF EXISTS students_factors CASCADE;
CREATE TABLE students_factors (
  id BIGINT NOT NULL AUTO_INCREMENT, -- Primary Key
  student_id INT NOT NULL, -- 학생 ID
  global_factor DOUBLE NOT NULL DEFAULT 1.0, -- 전역 보정계수
  initialized BOOLEAN NOT NULL DEFAULT FALSE, -- 초기화 여부
  initial_score INT DEFAULT NULL, -- 초기 성적
  initialized_at DATETIME DEFAULT NULL, -- 초기화 시각
  total_learning_count INT NOT NULL DEFAULT 0, -- 총 학습 횟수
  last_learning_at DATETIME DEFAULT NULL, -- 마지막 학습 시각
  avg_modification_rate DOUBLE DEFAULT NULL, -- 평균 수정률
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 수정일
  PRIMARY KEY (id),
  UNIQUE KEY UK_SF_STUDENT_ID (student_id)
);

-- students_quest_factors (학생 보정계수 - 난이도별)
DROP TABLE IF EXISTS students_quest_factors CASCADE;
CREATE TABLE students_quest_factors (
  id BIGINT NOT NULL AUTO_INCREMENT, -- Primary Key
  student_factor_id BIGINT NOT NULL, -- students_factors 참조
  difficulty ENUM('EASY', 'BASIC', 'MEDIUM', 'HARD', 'VERY_HARD') NOT NULL, -- 난이도
  factor_value DOUBLE NOT NULL, -- 해당 난이도 보정계수
  learning_count INT NOT NULL DEFAULT 0, -- 해당 난이도 학습 횟수
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 수정일
  PRIMARY KEY (id)
);

-- classes (학급)
DROP TABLE IF EXISTS classes CASCADE;
CREATE TABLE classes (
  class_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  teacher_id INT, -- 교사 id
  class_name VARCHAR(100) NOT NULL, -- 학급이름
  invite_code VARCHAR(20) NOT NULL, -- 초대코드
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 생성일
  grade VARCHAR(20), -- 학년
  subject VARCHAR(20), -- 과목
  description VARCHAR(100), -- 반 설명
  deleted_at DATETIME DEFAULT NULL, -- Soft Delete
  PRIMARY KEY (class_id),
  UNIQUE KEY UK_INVITE_CODE (invite_code)
);

-- quests (퀘스트)
DROP TABLE IF EXISTS quests CASCADE;
CREATE TABLE quests (
  quest_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  teacher_id INT, -- 교사 id
  title VARCHAR(255) NOT NULL, -- 제목
  teacher_content TEXT, -- 내용
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 생성일
  reward_coral_default INT DEFAULT 0, -- 코랄 보상
  reward_research_data_default INT DEFAULT 0, -- 탐사데이터 보상
  deadline DATETIME, -- 마감일
  difficulty ENUM('EASY', 'BASIC', 'MEDIUM', 'HARD', 'VERY_HARD'), -- 난이도
  deleted_at DATETIME DEFAULT NULL, -- Soft Delete
  PRIMARY KEY (quest_id)
);

-- quest_assignments (퀘스트 할당)
DROP TABLE IF EXISTS quest_assignments CASCADE;
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
DROP TABLE IF EXISTS submissions CASCADE;
CREATE TABLE submissions (
  submission_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  assignment_id INT, -- 퀘스트 할당 id
  attachment_url VARCHAR(255), -- 첨부파일 경로
  student_content TEXT, -- 학생 제출 내용
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 제출시각
  comment TEXT, -- 선생님 코멘트
  PRIMARY KEY (submission_id)
);

-- group_quests (단체퀘스트)
DROP TABLE IF EXISTS group_quests CASCADE;
CREATE TABLE group_quests (
  group_quest_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  teacher_id INT, -- 교사 id
  class_id INT, -- 학급 id
  title VARCHAR(255) NOT NULL, -- 제목
  reward_coral INT DEFAULT 0, -- 코랄 보상
  reward_research_data INT DEFAULT 0, -- 탐사데이터 보상
  end_date DATETIME, -- 퀘스트 마감일
  status ENUM('ACTIVE', 'COMPLETED', 'FAILED'), -- 상태
  content TEXT, -- 내용
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 생성일
  type ENUM('ATTENDANCE', 'ASSIGNMENT', 'PARTICIPATION', 'EXAM', 'OTHER'),
  PRIMARY KEY (group_quest_id)
);

-- group_quest_progress (단체 퀘스트 학생별 진행 상황)
DROP TABLE IF EXISTS group_quest_progress CASCADE;
CREATE TABLE group_quest_progress (
  progress_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  group_quest_id INT, -- 단체 퀘스트 id
  student_id INT, -- 학생 id
  is_completed BOOLEAN, -- 해당 학생의 완료 여부
  completed_at DATETIME DEFAULT NULL, -- 학생 완료/체크 시각
  PRIMARY KEY (progress_id)
);

-- raids (레이드) - sca_v1 구조 통합
DROP TABLE IF EXISTS raids CASCADE;
CREATE TABLE raids (
  raid_id INT NOT NULL AUTO_INCREMENT,
  teacher_id INT NOT NULL,
  class_id INT NOT NULL,
  raid_name VARCHAR(120) NOT NULL,
  boss_type ENUM('ZELUS_INDUSTRY','KRAKEN') NOT NULL,
  difficulty ENUM('LOW','MEDIUM','HIGH') NOT NULL,
  status ENUM('ACTIVE','COMPLETED','EXPIRED','TERMINATED') NOT NULL DEFAULT 'ACTIVE',
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  total_boss_hp BIGINT NOT NULL,
  current_boss_hp BIGINT NOT NULL,
  reward_coral INT DEFAULT 0,
  special_reward_description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (raid_id),
  KEY IDX_RAIDS_CLASS_ID (class_id)
);

-- contributions (레이드 기여도)
DROP TABLE IF EXISTS contributions CASCADE;
CREATE TABLE contributions (
  contribution_id INT NOT NULL AUTO_INCREMENT,
  raid_id INT NOT NULL,
  student_id INT NOT NULL,
  damage INT NOT NULL DEFAULT 0,
  last_attack_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (contribution_id),
  UNIQUE KEY UK_CONTRIBUTION_RAID_STUDENT (raid_id, student_id),
  KEY IDX_CONTRIBUTIONS_STUDENT_ID (student_id)
);

-- raid_logs (선택적 레이드 로그)
DROP TABLE IF EXISTS raid_logs CASCADE;
CREATE TABLE raid_logs (
  raid_log_id BIGINT NOT NULL AUTO_INCREMENT,
  raid_id INT NOT NULL,
  student_id INT,
  log_type ENUM('ATTACK','REWARD','SYSTEM') NOT NULL,
  damage_amount INT DEFAULT 0,
  research_data_used INT DEFAULT 0,
  remaining_boss_hp BIGINT,
  message VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (raid_log_id),
  KEY IDX_RAID_LOG_RAID_ID (raid_id)
);

-- fish (물고기 마스터 데이터)
DROP TABLE IF EXISTS fish CASCADE;
CREATE TABLE fish (
  fish_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  fish_name VARCHAR(100) NOT NULL, -- 물고기 이름
  grade VARCHAR(20), -- 등급
  probability FLOAT, -- 확률
  PRIMARY KEY (fish_id)
);

-- collections (학생 개인 도감)
DROP TABLE IF EXISTS collections CASCADE;
CREATE TABLE collections (
  collection_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  student_id INT NOT NULL, -- 학생 id
  PRIMARY KEY (collection_id),
  UNIQUE KEY UK_COLLECTIONS_STUDENT_ID (student_id)
);

-- collection_entries (도감 수집 내역)
DROP TABLE IF EXISTS collection_entries CASCADE;
CREATE TABLE collection_entries (
  entry_id INT NOT NULL AUTO_INCREMENT, -- Primary Key
  collection_id INT, -- 학생 개인 도감 id
  fish_id INT, -- 물고기 마스터 데이터 id
  fish_count INT NOT NULL DEFAULT 1, -- 물고기 개수
  PRIMARY KEY (entry_id),
  UNIQUE KEY UK_COLLECTION_FISH (collection_id, fish_id) -- Indexes: (collection_id, fish_id) [Unique]
);

-- notice (공지)
DROP TABLE IF EXISTS notice CASCADE;
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
DROP TABLE IF EXISTS action_logs CASCADE;
CREATE TABLE action_logs (
  log_id BIGINT NOT NULL AUTO_INCREMENT, -- Primary Key
  student_id INT, -- 학생 id
  action_type VARCHAR(50), -- 활동 종류
  assignment_id INT, -- 퀘스트 할당 id
  group_quest_id INT, -- 단체 퀘스트 id
  raid_id INT, -- 레이드 id
  change_coral INT, -- 코랄 변화량
  change_research INT, -- 탐사데이터 변화량
  log_message VARCHAR(255), -- 로그 메시지
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 활동 발생 시간
  PRIMARY KEY (log_id)
);

-- ai_learning_logs (AI 학습 로그)
DROP TABLE IF EXISTS ai_learning_logs CASCADE;
CREATE TABLE ai_learning_logs (
  id BIGINT NOT NULL AUTO_INCREMENT, -- Primary Key
  assignment_id INT NOT NULL, -- 퀘스트 할당 ID (quest_assignments)
  student_id INT NOT NULL, -- 학생 ID
  difficulty ENUM('EASY', 'BASIC', 'MEDIUM', 'HARD', 'VERY_HARD') NOT NULL, -- 퀘스트 난이도
  cognitive_score INT NOT NULL, -- 인지과정 점수
  effort_score INT NOT NULL, -- 예상 노력 점수
  ai_coral INT NOT NULL, -- AI 추천 코랄
  ai_research_data INT NOT NULL, -- AI 추천 탐사데이터
  teacher_coral INT NOT NULL, -- 교사 확정 코랄
  teacher_research_data INT NOT NULL, -- 교사 확정 탐사데이터
  learned BOOLEAN NOT NULL DEFAULT FALSE, -- 학습 완료 여부
  learned_at DATETIME DEFAULT NULL, -- 학습 시각
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 생성일
  PRIMARY KEY (id)
);

-- ---
-- 외래 키 및 인덱스 추가
-- ---

-- teachers
ALTER TABLE teachers
  ADD CONSTRAINT FK_TEACHERS_MEMBERS FOREIGN KEY (member_id) REFERENCES members (member_id) ON DELETE CASCADE;

-- students
ALTER TABLE students
  ADD CONSTRAINT FK_STUDENTS_MEMBERS FOREIGN KEY (member_id) REFERENCES members (member_id) ON DELETE CASCADE;
ALTER TABLE students
  ADD CONSTRAINT FK_STUDENTS_CLASSES FOREIGN KEY (class_id) REFERENCES classes (class_id) ON DELETE SET NULL;
CREATE INDEX IDX_STUDENTS_CLASS_ID ON students (class_id);

-- students_factors
ALTER TABLE students_factors
  ADD CONSTRAINT FK_SF_STUDENTS FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE CASCADE;

-- students_quest_factors
ALTER TABLE students_quest_factors
  ADD CONSTRAINT FK_SQF_STUDENT_FACTOR FOREIGN KEY (student_factor_id) REFERENCES students_factors (id) ON DELETE CASCADE;

-- classes
ALTER TABLE classes
  ADD CONSTRAINT FK_CLASSES_TEACHERS FOREIGN KEY (teacher_id) REFERENCES teachers (member_id) ON DELETE SET NULL;
CREATE INDEX IDX_CLASSES_TEACHER_ID ON classes (teacher_id);

-- quests
ALTER TABLE quests
  ADD CONSTRAINT FK_QUESTS_TEACHERS FOREIGN KEY (teacher_id) REFERENCES teachers (member_id) ON DELETE SET NULL;

-- quest_assignments
ALTER TABLE quest_assignments
  ADD CONSTRAINT FK_ASSIGNMENTS_QUESTS FOREIGN KEY (quest_id) REFERENCES quests (quest_id) ON DELETE CASCADE;
ALTER TABLE quest_assignments
  ADD CONSTRAINT FK_ASSIGNMENTS_STUDENTS FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE CASCADE;
CREATE INDEX IDX_ASSIGNMENTS_QUEST_ID ON quest_assignments (quest_id);
CREATE INDEX IDX_ASSIGNMENTS_STUDENT_ID ON quest_assignments (student_id);
CREATE INDEX IDX_ASSIGNMENTS_STATUS ON quest_assignments (status);

-- submissions
ALTER TABLE submissions
  ADD CONSTRAINT FK_SUBMISSIONS_ASSIGNMENTS FOREIGN KEY (assignment_id) REFERENCES quest_assignments (assignment_id) ON DELETE CASCADE;
CREATE INDEX IDX_SUBMISSIONS_SUBMITTED_AT ON submissions (submitted_at);

-- group_quests
ALTER TABLE group_quests
  ADD CONSTRAINT FK_GROUP_QUESTS_TEACHERS FOREIGN KEY (teacher_id) REFERENCES teachers (member_id) ON DELETE SET NULL;
ALTER TABLE group_quests
  ADD CONSTRAINT FK_GROUP_QUESTS_CLASSES FOREIGN KEY (class_id) REFERENCES classes (class_id) ON DELETE SET NULL;
CREATE INDEX IDX_GROUP_QUESTS_TEACHER_ID ON group_quests (teacher_id);
CREATE INDEX IDX_GROUP_QUESTS_CLASS_ID ON group_quests (class_id);

-- group_quest_progress
ALTER TABLE group_quest_progress
  ADD CONSTRAINT FK_PROGRESS_GROUP_QUESTS FOREIGN KEY (group_quest_id) REFERENCES group_quests (group_quest_id) ON DELETE CASCADE;
ALTER TABLE group_quest_progress
  ADD CONSTRAINT FK_PROGRESS_STUDENTS FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE CASCADE;
CREATE INDEX IDX_PROGRESS_STUDENT_ID ON group_quest_progress (student_id);

-- raids
ALTER TABLE raids
  ADD CONSTRAINT FK_RAIDS_TEACHERS FOREIGN KEY (teacher_id) REFERENCES teachers (member_id) ON DELETE SET NULL;
ALTER TABLE raids
  ADD CONSTRAINT FK_RAIDS_CLASSES FOREIGN KEY (class_id) REFERENCES classes (class_id) ON DELETE SET NULL;

-- contributions
ALTER TABLE contributions
  ADD CONSTRAINT FK_CONTRIBUTIONS_RAIDS FOREIGN KEY (raid_id) REFERENCES raids (raid_id) ON DELETE CASCADE;
ALTER TABLE contributions
  ADD CONSTRAINT FK_CONTRIBUTIONS_STUDENTS FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE CASCADE;

-- raid_logs
ALTER TABLE raid_logs
  ADD CONSTRAINT FK_RAID_LOG_RAID FOREIGN KEY (raid_id) REFERENCES raids (raid_id) ON DELETE CASCADE;
ALTER TABLE raid_logs
  ADD CONSTRAINT FK_RAID_LOG_STUDENT FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE SET NULL;

-- fish
CREATE INDEX IDX_FISH_GRADE ON fish (grade);

-- collections
ALTER TABLE collections
  ADD CONSTRAINT FK_COLLECTIONS_STUDENTS FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE CASCADE;

-- collection_entries
ALTER TABLE collection_entries
  ADD CONSTRAINT FK_ENTRIES_COLLECTIONS FOREIGN KEY (collection_id) REFERENCES collections (collection_id) ON DELETE CASCADE;
ALTER TABLE collection_entries
  ADD CONSTRAINT FK_ENTRIES_FISH FOREIGN KEY (fish_id) REFERENCES fish (fish_id) ON DELETE RESTRICT;

-- notice
ALTER TABLE notice
  ADD CONSTRAINT FK_NOTICE_STUDENTS FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE SET NULL;
ALTER TABLE notice
  ADD CONSTRAINT FK_NOTICE_ASSIGNMENTS FOREIGN KEY (assignment_id) REFERENCES quest_assignments (assignment_id) ON DELETE SET NULL;
ALTER TABLE notice
  ADD CONSTRAINT FK_NOTICE_GROUP_QUESTS FOREIGN KEY (group_quest_id) REFERENCES group_quests (group_quest_id) ON DELETE SET NULL;
ALTER TABLE notice
  ADD CONSTRAINT FK_NOTICE_RAIDS FOREIGN KEY (raid_id) REFERENCES raids (raid_id) ON DELETE SET NULL;
CREATE INDEX IDX_NOTICE_STUDENT_CREATED ON notice (student_id, created_at);
CREATE INDEX IDX_NOTICE_TYPE ON notice (notice_type);

-- action_logs
ALTER TABLE action_logs
  ADD CONSTRAINT FK_LOGS_STUDENTS FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE SET NULL;
ALTER TABLE action_logs
  ADD CONSTRAINT FK_LOGS_ASSIGNMENTS FOREIGN KEY (assignment_id) REFERENCES quest_assignments (assignment_id) ON DELETE SET NULL;
ALTER TABLE action_logs
  ADD CONSTRAINT FK_LOGS_GROUP_QUESTS FOREIGN KEY (group_quest_id) REFERENCES group_quests (group_quest_id) ON DELETE SET NULL;
ALTER TABLE action_logs
  ADD CONSTRAINT FK_LOGS_RAIDS FOREIGN KEY (raid_id) REFERENCES raids (raid_id) ON DELETE SET NULL;
CREATE INDEX IDX_LOGS_STUDENT_CREATED ON action_logs (student_id, created_at);
CREATE INDEX IDX_LOGS_ACTION_TYPE ON action_logs (action_type);

-- ai_learning_logs
ALTER TABLE ai_learning_logs
  ADD CONSTRAINT FK_AI_LOGS_ASSIGNMENTS FOREIGN KEY (assignment_id) REFERENCES quest_assignments (assignment_id) ON DELETE CASCADE;
ALTER TABLE ai_learning_logs
  ADD CONSTRAINT FK_AI_LOGS_STUDENTS FOREIGN KEY (student_id) REFERENCES students (member_id) ON DELETE CASCADE;

SET REFERENTIAL_INTEGRITY TRUE;

