-- ============================================
-- SCA-BE Test Data Initialization Script
-- ============================================

-- 1. Fish (Master Data) - Fish available through gacha
-- fish_id is auto-generated
-- Probability calculation:
-- COMMON (70%): 7 fish -> 70/7 = 10% each
-- RARE (25%): 4 fish -> 25/4 = 6.25% each
-- LEGENDARY (5%): 2 fish -> 5/2 = 2.5% each (빈칸으로 표시)
-- Total: 100%
INSERT INTO fish (fish_name, grade, probability) VALUES
-- COMMON (7개)
('열대어', 'COMMON', 0.10),
('금붕어', 'COMMON', 0.10),
('구피', 'COMMON', 0.10),
('네온테트라', 'COMMON', 0.10),
('흰동가리', 'COMMON', 0.10),
('해마', 'COMMON', 0.10),
('복어', 'COMMON', 0.10),
-- RARE (4개)
('가오리', 'RARE', 0.0625),
('상어', 'RARE', 0.0625),
('범고래', 'RARE', 0.0625),
('바다거북', 'RARE', 0.0625),
-- LEGENDARY (2개) - 빈칸으로 표시
('???', 'LEGENDARY', 0.025),
('???', 'LEGENDARY', 0.025);

-- 2. Members (User Base Info) - 3 Teachers, 10 Students
-- member_id is auto-generated
-- Password: "password123" (BCrypt Hash)
-- BCrypt Hash: $2a$10$sp2WRqBmMCocuoe0zXyiYOG0VQriJ6w98sZs337HQl7hbxEpA4xKq
INSERT INTO members (username, password, real_name, nickname, email, role, created_at) VALUES
-- Teachers
('teacher1', '$2a$10$sp2WRqBmMCocuoe0zXyiYOG0VQriJ6w98sZs337HQl7hbxEpA4xKq', 'Kim Teacher', 'Teacher Kim', 'teacher1@sca.edu', 'TEACHER', NOW()),
('teacher2', '$2a$10$sp2WRqBmMCocuoe0zXyiYOG0VQriJ6w98sZs337HQl7hbxEpA4xKq', 'Lee Teacher', 'Teacher Lee', 'teacher2@sca.edu', 'TEACHER', NOW()),
('teacher3', '$2a$10$sp2WRqBmMCocuoe0zXyiYOG0VQriJ6w98sZs337HQl7hbxEpA4xKq', 'Park Teacher', 'Teacher Park', 'teacher3@sca.edu', 'TEACHER', NOW()),
-- Students
('student1', '$2a$10$sp2WRqBmMCocuoe0zXyiYOG0VQriJ6w98sZs337HQl7hbxEpA4xKq', 'Hong Gildong', 'Gildong', 'student1@sca.edu', 'STUDENT', NOW()),
('student2', '$2a$10$sp2WRqBmMCocuoe0zXyiYOG0VQriJ6w98sZs337HQl7hbxEpA4xKq', 'Kim Cheolsu', 'Cheolsu', 'student2@sca.edu', 'STUDENT', NOW()),
('student3', '$2a$10$sp2WRqBmMCocuoe0zXyiYOG0VQriJ6w98sZs337HQl7hbxEpA4xKq', 'Lee Younghee', 'Younghee', 'student3@sca.edu', 'STUDENT', NOW()),
('student4', '$2a$10$sp2WRqBmMCocuoe0zXyiYOG0VQriJ6w98sZs337HQl7hbxEpA4xKq', 'Park Minsu', 'Minsu', 'student4@sca.edu', 'STUDENT', NOW()),
('student5', '$2a$10$sp2WRqBmMCocuoe0zXyiYOG0VQriJ6w98sZs337HQl7hbxEpA4xKq', 'Choi Jieun', 'Jieun', 'student5@sca.edu', 'STUDENT', NOW()),
('student6', '$2a$10$sp2WRqBmMCocuoe0zXyiYOG0VQriJ6w98sZs337HQl7hbxEpA4xKq', 'Jung Suhyun', 'Suhyun', 'student6@sca.edu', 'STUDENT', NOW()),
('student7', '$2a$10$sp2WRqBmMCocuoe0zXyiYOG0VQriJ6w98sZs337HQl7hbxEpA4xKq', 'Kang Minjun', 'Minjun', 'student7@sca.edu', 'STUDENT', NOW()),
('student8', '$2a$10$sp2WRqBmMCocuoe0zXyiYOG0VQriJ6w98sZs337HQl7hbxEpA4xKq', 'Cho Seoyeon', 'Seoyeon', 'student8@sca.edu', 'STUDENT', NOW()),
('student9', '$2a$10$sp2WRqBmMCocuoe0zXyiYOG0VQriJ6w98sZs337HQl7hbxEpA4xKq', 'Yoon Haneul', 'Haneul', 'student9@sca.edu', 'STUDENT', NOW()),
('student10', '$2a$10$sp2WRqBmMCocuoe0zXyiYOG0VQriJ6w98sZs337HQl7hbxEpA4xKq', 'Jang Seojun', 'Seojun', 'student10@sca.edu', 'STUDENT', NOW());

-- 3. Teachers (Teacher Info)
-- member_id is manually assigned (uses @MapsId from Member)
INSERT INTO teachers (member_id) VALUES
(1),
(2),
(3);

-- 4. Classes (Class Info) - Each teacher manages one class
-- class_id is auto-generated
INSERT INTO classes (teacher_id, class_name, invite_code, grade, subject, description, created_at) VALUES
(1, 'Grade 3 Class 1', 'INVITE001', 'Grade 3', 'Math', 'Fun Math Class', NOW()),
(2, 'Grade 2 Class 3', 'INVITE002', 'Grade 2', 'Science', 'Exciting Science Lab', NOW()),
(3, 'Grade 1 Class 2', 'INVITE003', 'Grade 1', 'English', 'Enjoyable English Class', NOW());

-- 5. Students (Student Info) - Assign class and resources to each student
-- member_id is manually assigned (uses @MapsId from Member)
INSERT INTO students (member_id, class_id, coral, research_data, grade) VALUES
-- Grade 3 Class 1 (Teacher Kim) - member_ids 4-7
(4, 1, 500, 200, 95.0),
(5, 1, 300, 150, 88.5),
(6, 1, 450, 180, 91.2),
(7, 1, 600, 250, 86.7),
-- Grade 2 Class 3 (Teacher Lee) - member_ids 8-10
(8, 2, 400, 160, 90.0),
(9, 2, 350, 140, 84.3),
(10, 2, 550, 220, 92.1),
-- Grade 1 Class 2 (Teacher Park) - member_ids 11-13
(11, 3, 250, 100, 80.0),
(12, 3, 300, 120, 82.4),
(13, 3, 400, 160, 89.5);

-- 6. Collections (Student Gacha Collections)
-- collection_id is auto-generated
INSERT INTO collections (student_id) VALUES
(4),
(5),
(6),
(7),
(8),
(9),
(10),
(11),
(12),
(13);

-- 7. Collection Entries (Fish owned by students)
-- entry_id is auto-generated
-- Note: fish_id and collection_id are now auto-generated, so we reference by position
-- Student 4 (Hong Gildong) - collection_id will be 1
INSERT INTO collection_entries (collection_id, fish_id, fish_count) VALUES
(1, 1, 3),
(1, 2, 2),
(1, 5, 1),
(1, 9, 1),
(1, 10, 1),
-- Student 5 (Kim Cheolsu) - collection_id will be 2
(2, 1, 5),
(2, 3, 2),
(2, 6, 1),
-- Student 6 (Lee Younghee) - collection_id will be 3
(3, 2, 3),
(3, 4, 4),
(3, 7, 2),
(3, 10, 1),
-- Student 7 (Park Minsu) - collection_id will be 4
(4, 1, 2),
(4, 5, 1),
(4, 8, 1),
-- Student 8 (Choi Jieun) - collection_id will be 5
(5, 3, 6),
(5, 6, 2),
-- Student 9 (Jung Suhyun) - collection_id will be 6
(6, 1, 1),
(6, 2, 1),
(6, 3, 1),
(6, 4, 1),
-- Student 10 (Kang Minjun) - collection_id will be 7
(7, 5, 2),
(7, 9, 1),
-- Student 11 (Cho Seoyeon) - collection_id will be 8
(8, 1, 3),
(8, 7, 1),
-- Student 12 (Yoon Haneul) - collection_id will be 9
(9, 2, 2),
(9, 6, 1),
-- Student 13 (Jang Seojun) - collection_id will be 10
(10, 4, 4),
(10, 8, 1);

-- 8. Personal Quests (Individual Quests)
-- quest_id is auto-generated
INSERT INTO quests (teacher_id, title, teacher_content, reward_coral_default, reward_research_data_default, deadline, difficulty, created_at) VALUES
(1, 'Math Workbook Practice', 'Complete Chapter 1 of the 2nd semester math workbook and submit photos.', 100, 50, '2025-12-31 23:59:59', 3, NOW()),
(1, 'Geometry Project', 'Submit a creative project using properties of triangles.', 200, 100, '2025-12-25 23:59:59', 5, NOW()),
(2, 'Science Experiment Report', 'Conduct water boiling point experiment and write a report.', 150, 75, '2025-12-20 23:59:59', 4, NOW()),
(2, 'Ecosystem Observation Journal', 'Observe the ecosystem around school and keep a journal for one week.', 120, 60, '2025-12-28 23:59:59', 3, NOW()),
(3, 'English Essay Writing', 'Write an essay on "My Dream" with at least 200 words.', 100, 50, '2025-12-22 23:59:59', 4, NOW());

-- 9. Quest Assignments (Individual Quest Assignments)
-- assignment_id is auto-generated
INSERT INTO quest_assignments (quest_id, student_id, reward_coral_personal, reward_research_data_personal, status) VALUES
-- Quest 1 assignments (Grade 3 Class 1 students: 4,5,6,7)
(1, 4, 100, 50, 'APPROVED'),
(1, 5, 100, 50, 'SUBMITTED'),
(1, 6, 120, 60, 'ASSIGNED'),
(1, 7, 90, 45, 'APPROVED'),
-- Quest 2 assignments
(2, 4, 200, 100, 'SUBMITTED'),
(2, 6, 240, 120, 'ASSIGNED'),
-- Quest 3 assignments (Grade 2 Class 3 students: 8,9,10)
(3, 8, 150, 75, 'APPROVED'),
(3, 9, 165, 82, 'SUBMITTED'),
(3, 10, 150, 75, 'ASSIGNED'),
-- Quest 4 assignments
(4, 8, 120, 60, 'ASSIGNED'),
-- Quest 5 assignments (Grade 1 Class 2 students: 11,12,13)
(5, 11, 100, 50, 'SUBMITTED'),
(5, 12, 100, 50, 'APPROVED'),
(5, 13, 80, 40, 'ASSIGNED');

-- 10. Submissions (Quest Submissions)
-- submission_id is auto-generated
INSERT INTO submissions (assignment_id, attachment_url, submitted_at, comment, student_content) VALUES
(1, 'https://storage.sca.edu/files/student1_math_hw.pdf', '2025-11-10 15:30:00', 'Great job!', 'I worked hard on this.'),
(2, 'https://storage.sca.edu/files/student2_math_hw.pdf', '2025-11-12 18:20:00', NULL, 'I solved all the problems.'),
(4, 'https://storage.sca.edu/files/student4_math_hw.pdf', '2025-11-11 20:00:00', 'Perfect!', 'Photo attached.'),
(5, 'https://storage.sca.edu/files/student1_geometry.pdf', '2025-11-13 14:00:00', NULL, 'Triangle project submission.'),
(7, 'https://storage.sca.edu/files/student5_science.pdf', '2025-11-14 16:30:00', 'Detailed experiment process.', 'Experiment result report.'),
(8, 'https://storage.sca.edu/files/student6_science.pdf', '2025-11-15 10:00:00', NULL, 'Water boiling point measurement complete'),
(11, 'https://storage.sca.edu/files/student8_essay.pdf', '2025-11-14 19:00:00', NULL, 'My Dream essay submission.'),
(12, 'https://storage.sca.edu/files/student9_essay.pdf', '2025-11-13 21:00:00', 'Touching story!', 'English essay submission.');

-- 11. Group Quests (Group Quests)
-- group_quest_id is auto-generated
INSERT INTO group_quests (teacher_id, class_id, title, status, reward_coral, reward_research_data, end_date, content, type, created_at) VALUES
(1, 1, 'Class Attendance Challenge', 'ACTIVE', 50, 25, '2025-11-30 23:59:59', 'Achieve 95% attendance rate for the entire class in November', 'ATTENDANCE', NOW()),
(1, 1, 'Math Assignment 100% Completion', 'COMPLETED', 100, 50, '2025-11-15 23:59:59', 'Everyone submits this weeks math assignment', 'ASSIGNMENT', NOW()),
(2, 2, 'Science Experiment Participation', 'ACTIVE', 75, 35, '2025-11-25 23:59:59', 'All students actively participate in experiments', 'PARTICIPATION', NOW()),
(3, 3, 'Midterm Exam All Pass', 'COMPLETED', 150, 75, '2025-11-10 23:59:59', 'Everyone scores 60+ on midterm exam', 'EXAM', NOW());

-- 12. Group Quest Progress (Group Quest Progress)
-- progress_id is auto-generated
INSERT INTO group_quest_progress (group_quest_id, student_id, is_completed, completed_at) VALUES
-- Attendance challenge (group_quest_id=1, In progress)
(1, 4, true, '2025-11-15 09:00:00'),
(1, 5, true, '2025-11-15 09:00:00'),
(1, 6, false, NULL),
(1, 7, true, '2025-11-15 09:00:00'),
-- Math assignment completion (group_quest_id=2, Completed)
(2, 4, true, '2025-11-14 18:00:00'),
(2, 5, true, '2025-11-14 20:00:00'),
(2, 6, true, '2025-11-15 10:00:00'),
(2, 7, true, '2025-11-14 19:00:00'),
-- Science experiment participation (group_quest_id=3, In progress)
(3, 8, true, '2025-11-14 14:00:00'),
(3, 9, true, '2025-11-14 14:00:00'),
(3, 10, false, NULL),
-- Midterm exam all pass (group_quest_id=4, Completed)
(4, 11, true, '2025-11-08 15:00:00'),
(4, 12, true, '2025-11-08 15:00:00'),
(4, 13, true, '2025-11-08 15:00:00');

-- 13. Raids (Raids)
-- raid_id is auto-generated
INSERT INTO raids (teacher_id, class_id, raid_name, boss_type, difficulty, status, start_date, end_date, total_boss_hp, current_boss_hp, reward_coral, special_reward_description) VALUES
(1, 1, '중간고사 대비 크라켄', 'KRAKEN', 'HIGH', 'ACTIVE', '2025-11-10 00:00:00', '2025-11-20 23:59:59', 10000, 3500, 200, 'Legendary grade fish acquisition opportunity'),
(2, 2, '헬릭스 인더스트리 소탕전', 'ZELUS_INDUSTRY', 'MEDIUM', 'COMPLETED', '2025-11-05 00:00:00', '2025-11-12 23:59:59', 5000, 0, 150, 'Rare grade fish x3'),
(3, 3, '기말 대비 정찰 작전', 'KRAKEN', 'LOW', 'ACTIVE', '2025-11-15 00:00:00', '2025-11-22 23:59:59', 3000, 2100, 100, 'Common grade fish x10');

-- 14. Contributions (Raid Contributions)
-- contribution_id is auto-generated
INSERT INTO contributions (raid_id, student_id, damage) VALUES
-- Raid 1 contributions (Grade 3 Class 1)
(1, 4, 2000),
(1, 5, 1500),
(1, 6, 1800),
(1, 7, 1200),
-- Raid 2 contributions (Grade 2 Class 3 - Completed)
(2, 8, 2000),
(2, 9, 1800),
(2, 10, 1200),
-- Raid 3 contributions (Grade 1 Class 2)
(3, 11, 300),
(3, 12, 400),
(3, 13, 200);

-- 15. Notices (Notifications)
-- notice_id is auto-generated
INSERT INTO notice (notice_type, student_id, assignment_id, group_quest_id, raid_id, title, content, created_at) VALUES
('PERSONAL_QUEST_ASSIGNED', 4, 1, NULL, NULL, 'New personal quest assigned', 'Math workbook practice quest assigned.', NOW()),
('PERSONAL_QUEST_APPROVED', 4, 1, NULL, NULL, 'Quest approved', 'Math workbook practice quest approved. Check your rewards!', NOW()),
('COMMUNITY_QUEST_ASSIGNED', 4, NULL, 1, NULL, 'New group quest', 'Class attendance challenge has started.', NOW()),
('COMMUNITY_QUEST_FINISHED', 4, NULL, 2, NULL, 'Group quest completed', 'Math assignment 100% completion achieved! Claim your rewards.', NOW()),
('RAID_STARTED', 4, NULL, NULL, 1, 'Raid started', 'Kraken raid has begun. Join now!', NOW()),
('RAID_FINISHED', 8, NULL, NULL, 2, 'Raid completed', 'Zelus Industry raid successfully completed!', NOW());

-- 16. Action Logs (Activity Logs)
-- log_id is auto-generated
INSERT INTO action_logs (student_id, action_type, assignment_id, group_quest_id, raid_id, change_coral, change_research, log_message, created_at) VALUES
(4, 'REWARD_RECEIVED', 1, NULL, NULL, 100, 50, 'Math workbook practice quest completion reward', NOW()),
(7, 'REWARD_RECEIVED', 4, NULL, NULL, 90, 45, 'Math workbook practice quest completion reward', NOW()),
(4, 'GROUP_QUEST_COMPLETE', NULL, 2, NULL, 100, 50, 'Math assignment 100% completion reward', NOW()),
(5, 'GROUP_QUEST_COMPLETE', NULL, 2, NULL, 100, 50, 'Math assignment 100% completion reward', NOW()),
(8, 'RAID_REWARD_RECEIVED', NULL, NULL, 2, 150, 0, 'Zelus Industry raid completion reward', NOW()),
(9, 'RAID_REWARD_RECEIVED', NULL, NULL, 2, 150, 0, 'Zelus Industry raid completion reward', NOW()),
(12, 'REWARD_RECEIVED', 12, NULL, NULL, 100, 50, 'My Dream essay writing completion reward', NOW());

-- ============================================
-- Data Initialization Complete
-- ============================================
