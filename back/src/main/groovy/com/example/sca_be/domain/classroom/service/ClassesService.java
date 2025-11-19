package com.example.sca_be.domain.classroom.service;

import com.example.sca_be.domain.auth.entity.Member;
import com.example.sca_be.domain.auth.entity.Student;
import com.example.sca_be.domain.auth.entity.Teacher;
import com.example.sca_be.domain.auth.repository.MemberRepository;
import com.example.sca_be.domain.auth.repository.StudentRepository;
import com.example.sca_be.domain.auth.repository.TeacherRepository;
import com.example.sca_be.domain.classroom.dto.*;
import com.example.sca_be.domain.classroom.entity.Classes;
import com.example.sca_be.domain.classroom.repository.ClassesRepository;
import com.example.sca_be.domain.classroom.util.InviteCodeGenerator;
import com.example.sca_be.domain.notification.entity.ActionLog;
import com.example.sca_be.domain.notification.repository.ActionLogRepository;
import com.example.sca_be.domain.personalquest.entity.QuestAssignment;
import com.example.sca_be.domain.personalquest.entity.QuestStatus;
import com.example.sca_be.domain.personalquest.entity.Submission;
import com.example.sca_be.domain.personalquest.repository.QuestAssignmentRepository;
import com.example.sca_be.domain.personalquest.repository.SubmissionRepository;
import com.example.sca_be.domain.raid.entity.Contribution;
import com.example.sca_be.domain.raid.entity.Raid;
import com.example.sca_be.domain.raid.entity.RaidStatus;
import com.example.sca_be.domain.raid.repository.ContributionRepository;
import com.example.sca_be.domain.raid.repository.RaidRepository;
import com.example.sca_be.global.exception.CustomException;
import com.example.sca_be.global.exception.ErrorCode;
import com.example.sca_be.global.security.principal.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClassesService {

    private final ClassesRepository classesRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final MemberRepository memberRepository;
    private final QuestAssignmentRepository questAssignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final RaidRepository raidRepository;
    private final ContributionRepository contributionRepository;
    private final ActionLogRepository actionLogRepository;
    private final Random random = new Random();

    //현재 로그인한 선생님의 반 목록 조회
    public ClassListResponse getClassList() {
        Teacher teacher = getCurrentTeacher();
        Member member = teacher.getMember();

        // teacher_id로 직접 조회 (더 안정적)
        List<Classes> classes = classesRepository.findByTeacher_MemberIdOrderByCreatedAtDesc(teacher.getMemberId());

        List<ClassListResponse.ClassSummary> classSummaries = classes.stream()
                .map(c -> {
                    int studentCount = studentRepository.countByClasses(c);

                    int waitingQuestCount = 0;//이거 나중에 퀘스트 관련 로직 잡고 고쳐야 함

                    return ClassListResponse.ClassSummary.builder()
                            .classId(c.getClassId())
                            .className(c.getClassName())
                            .studentCount(studentCount)
                            .waitingQuestCount(waitingQuestCount)
                            .build();
                })
                .collect(Collectors.toList());

        return ClassListResponse.builder()
                .teacherName(member.getRealName())
                .classes(classSummaries)
                .totalCount(classSummaries.size())
                .build();
    }

    //반 생성
    @Transactional
    public CreateClassResponse createClass(CreateClassRequest request) {
        Teacher teacher = getCurrentTeacher();
        Member member = teacher.getMember();

        // 초대 코드 생성 (중복 체크)
        String inviteCode = generateUniqueInviteCode();

        Classes classes = Classes.builder()
                .teacher(teacher)
                .className(request.getClassName())
                .inviteCode(inviteCode)
                .grade(request.getGrade())
                .subject(request.getSubject())
                .description(request.getDescription())
                .build();

        Classes savedClass = classesRepository.save(classes);

        return CreateClassResponse.builder()
                .classId(savedClass.getClassId())
                .className(savedClass.getClassName())
                .grade(savedClass.getGrade())
                .subject(savedClass.getSubject())
                .inviteCode(savedClass.getInviteCode())
                .teacherId(teacher.getMemberId())
                .teacherName(member.getRealName())
                .studentCount(0)
                .createdAt(savedClass.getCreatedAt())
                .build();
    }

    //반의 학생 리스트 조회
    public StudentListResponse getStudentList(Integer classId) {
        Teacher teacher = getCurrentTeacher();

        Classes classes = classesRepository.findById(classId)
                .orElseThrow(() -> new CustomException(ErrorCode.CLASS_NOT_FOUND));

        // 본인이 생성한 반만 조회 가능
        if (!classes.getTeacher().getMemberId().equals(teacher.getMemberId())) {
            throw new CustomException(ErrorCode.CLASS_ACCESS_DENIED);
        }

        List<Student> students = studentRepository.findByClassesOrderByMember_RealNameAsc(classes);

        List<StudentListResponse.StudentInfo> studentInfos = students.stream()
                .map(s -> {

                    int pendingQuests = random.nextInt(4);//일단 quest 구현 전이어서 랜덤으로 설정

                    return StudentListResponse.StudentInfo.builder()
                            .studentId(s.getMemberId())
                            .name(s.getMember().getRealName())
                            .pendingQuests(pendingQuests)
                            .coral(s.getCoral() != null ? s.getCoral() : 0)
                            .researchData(s.getResearchData() != null ? s.getResearchData() : 0)
                            .build();
                })
                .collect(Collectors.toList());

        return StudentListResponse.builder()
                .classId(classes.getClassId())
                .className(classes.getClassName())
                .studentCount(studentInfos.size())
                .students(studentInfos)
                .build();
    }

    //반 상세 조회 (진행 중인 퀘스트 및 레이드 정보 포함)
    @Transactional
    public ClassDetailResponse getClassDetail(Integer classId) {
        Teacher teacher = getCurrentTeacher();

        Classes classes = classesRepository.findById(classId)
                .orElseThrow(() -> new CustomException(ErrorCode.CLASS_NOT_FOUND));

        // 본인이 생성한 반만 조회 가능
        if (!classes.getTeacher().getMemberId().equals(teacher.getMemberId())) {
            throw new CustomException(ErrorCode.CLASS_ACCESS_DENIED);
        }

        int studentCount = studentRepository.countByClasses(classes);

        // 임시 하드코딩: 진행 중인 단체 퀘스트
        List<ClassDetailResponse.OngoingGroupQuest> ongoingGroupQuests = List.of(
                ClassDetailResponse.OngoingGroupQuest.builder()
                        .questId(101)
                        .title("출석 체크")
                        .progress(ClassDetailResponse.QuestProgress.builder()
                                .completed(Math.min(studentCount - 3, studentCount))
                                .required(studentCount)
                                .build())
                        .build(),
                ClassDetailResponse.OngoingGroupQuest.builder()
                        .questId(102)
                        .title("수업 참여도")
                        .progress(ClassDetailResponse.QuestProgress.builder()
                                .completed(Math.min(studentCount - 1, studentCount))
                                .required(studentCount)
                                .build())
                        .build(),
                ClassDetailResponse.OngoingGroupQuest.builder()
                        .questId(103)
                        .title("과제 제출")
                        .progress(ClassDetailResponse.QuestProgress.builder()
                                .completed(Math.min(studentCount - 4, studentCount))
                                .required(studentCount)
                                .build())
                        .build()
        );

        // 실제 데이터베이스에서 진행 중인 레이드 조회
        ClassDetailResponse.OngoingRaid ongoingRaid = null;
        Raid activeRaid = raidRepository.findByClasses_ClassIdAndStatus(classId, RaidStatus.ACTIVE)
                .orElse(null);

        // 만료된 레이드 확인 및 상태 업데이트
        if (activeRaid != null && activeRaid.getEndDate() != null) {
            LocalDateTime now = LocalDateTime.now();
            if (now.isAfter(activeRaid.getEndDate())) {
                // 만료된 레이드는 EXPIRED 상태로 변경
                activeRaid.expire();
                raidRepository.save(activeRaid);
                activeRaid = null; // 활성 레이드가 아니므로 null로 설정
            }
        }

        // 활성 레이드가 있으면 정보 구성
        if (activeRaid != null) {
            Long bossHpCurrent = activeRaid.getCurrentBossHp() != null ? activeRaid.getCurrentBossHp() : 0L;
            Long bossHpTotal = activeRaid.getTotalBossHp() != null ? activeRaid.getTotalBossHp() : 1L;
            int percentage = bossHpTotal > 0 ? (int)((bossHpCurrent * 100) / bossHpTotal) : 0;

            // 참여자 수 계산 (기여도가 있는 학생 수)
            int participants = contributionRepository.countByRaid(activeRaid);

            // 종료 날짜 포맷팅
            String endDateStr = activeRaid.getEndDate() != null 
                    ? activeRaid.getEndDate().format(DateTimeFormatter.ISO_DATE_TIME)
                    : null;

            ongoingRaid = ClassDetailResponse.OngoingRaid.builder()
                    .raidId(activeRaid.getRaidId())
                    .title(activeRaid.getRaidName())
                    .bossHp(ClassDetailResponse.BossHp.builder()
                            .current(bossHpCurrent)
                            .total(bossHpTotal)
                            .percentage(percentage)
                            .build())
                    .participants(participants)
                    .endDate(endDateStr)
                    .status(activeRaid.getStatus() != null ? activeRaid.getStatus().name() : null)
                    .build();
        }

        return ClassDetailResponse.builder()
                .classId(classes.getClassId())
                .className(classes.getClassName())
                .inviteCode(classes.getInviteCode())
                .ongoingGroupQuests(ongoingGroupQuests)
                .ongoingRaid(ongoingRaid)
                .build();
    }

    //현재 로그인한 선생님 조회
    private Teacher getCurrentTeacher() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Integer memberId = userDetails.getMemberId();

        return teacherRepository.findById(memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.TEACHER_NOT_FOUND));
    }

    //코드 생성 로직
    private String generateUniqueInviteCode() {
        String inviteCode;
        int maxAttempts = 10;
        int attempts = 0;

        do {
            inviteCode = InviteCodeGenerator.generate();
            attempts++;

            if (attempts >= maxAttempts) {
                throw new CustomException(ErrorCode.INVITE_CODE_GENERATION_FAILED);
            }
        } while (classesRepository.existsByInviteCode(inviteCode));

        return inviteCode;
    }

    /**
     * 반 활동 대시보드 데이터 조회
     * GET /api/classes/{classId}/dashboard
     */
    public ClassDashboardResponse getClassDashboard(Integer classId) {
        Teacher teacher = getCurrentTeacher();
        Classes classes = classesRepository.findById(classId)
                .orElseThrow(() -> new CustomException(ErrorCode.CLASS_NOT_FOUND));

        // 본인이 생성한 반만 조회 가능
        if (!classes.getTeacher().getMemberId().equals(teacher.getMemberId())) {
            throw new CustomException(ErrorCode.CLASS_ACCESS_DENIED);
        }

        List<Student> students = studentRepository.findByClassesOrderByMember_RealNameAsc(classes);
        List<Integer> studentIds = students.stream()
                .map(Student::getMemberId)
                .collect(Collectors.toList());

        // 이번 주 기간 계산 (월요일 00:00 ~ 일요일 23:59)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekStart = now.minusDays(now.getDayOfWeek().getValue() - 1)
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime weekEnd = weekStart.plusDays(6).withHour(23).withMinute(59).withSecond(59);

        // 1. 이번 주 요약 데이터
        List<Submission> weekSubmissions = submissionRepository.findByClassAndDateRange(classId, weekStart, weekEnd);

        List<QuestAssignment> weekAssignments = questAssignmentRepository.findAll().stream()
                .filter(qa -> studentIds.contains(qa.getStudent().getMemberId()) &&
                             qa.getQuest().getCreatedAt().isAfter(weekStart) &&
                             qa.getQuest().getCreatedAt().isBefore(weekEnd))
                .collect(Collectors.toList());

        int submissions = weekSubmissions.size();
        int approvals = (int) weekSubmissions.stream()
                .filter(s -> s.getQuestAssignment().getStatus() == QuestStatus.APPROVED)
                .count();
        double approvalRate = submissions > 0 ? (approvals * 100.0 / submissions) : 0.0;

        // 레이드 공격 데이터 (이번 주) - Contribution 테이블 기반
        List<Contribution> weekContributions = contributionRepository.findByClassId(classId);

        // 공격 횟수는 Contribution의 개수로 계산
        int raidAttacks = weekContributions.size();
        Set<Integer> raidParticipantIds = weekContributions.stream()
                .map(contribution -> contribution.getStudent().getMemberId())
                .collect(Collectors.toSet());
        int raidParticipants = raidParticipantIds.size();

        // 코랄 지급 총합 (이번 주)
        List<ActionLog> weekActionLogs = actionLogRepository.findByClassAndDateRangeWithCoralReward(
                classId, weekStart, weekEnd);

        int totalCoralRewarded = weekActionLogs.stream()
                .mapToInt(log -> log.getChangeCoral() != null ? log.getChangeCoral() : 0)
                .sum();

        // 탐사데이터 사용량 - Contribution 테이블에는 없으므로 0으로 설정
        // (실제 사용량은 다른 곳에서 관리되거나 계산 불가)
        int totalResearchDataUsed = 0;
        double averageResearchDataPerStudent = 0.0;

        // 2. 퀘스트 활동 추이 (최근 7일)
        List<ClassDashboardResponse.QuestActivityTrend> questActivityTrend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDateTime dayStart = weekStart.plusDays(i).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime dayEnd = dayStart.plusDays(1).minusSeconds(1);

            long daySubmissions = weekSubmissions.stream()
                    .filter(s -> {
                        LocalDateTime submittedAt = s.getSubmittedAt();
                        return submittedAt.isAfter(dayStart) && submittedAt.isBefore(dayEnd);
                    })
                    .count();

            long dayApprovals = weekSubmissions.stream()
                    .filter(s -> {
                        LocalDateTime submittedAt = s.getSubmittedAt();
                        return submittedAt.isAfter(dayStart) && submittedAt.isBefore(dayEnd) &&
                               s.getQuestAssignment().getStatus() == QuestStatus.APPROVED;
                    })
                    .count();

            questActivityTrend.add(ClassDashboardResponse.QuestActivityTrend.builder()
                    .date(dayStart.format(DateTimeFormatter.ofPattern("MM/dd")))
                    .submissions((int) daySubmissions)
                    .approvals((int) dayApprovals)
                    .build());
        }

        // 3. 제출 많이 한 학생 TOP 3
        Map<Integer, Long> submissionCountByStudent = weekSubmissions.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getQuestAssignment().getStudent().getMemberId(),
                        Collectors.counting()
                ));

        List<ClassDashboardResponse.TopStudent> topSubmitters = submissionCountByStudent.entrySet().stream()
                .sorted(Map.Entry.<Integer, Long>comparingByValue().reversed())
                .limit(3)
                .map(entry -> {
                    Student student = students.stream()
                            .filter(s -> s.getMemberId().equals(entry.getKey()))
                            .findFirst()
                            .orElse(null);
                    return ClassDashboardResponse.TopStudent.builder()
                            .studentId(entry.getKey())
                            .studentName(student != null ? student.getMember().getRealName() : "알 수 없음")
                            .submissionCount(entry.getValue().intValue())
                            .build();
                })
                .collect(Collectors.toList());

        // 4. 레이드 참여자 (공격량 기준) - Contribution 테이블 기반
        Map<Integer, ClassDashboardResponse.RaidParticipant> participantMap = new HashMap<>();
        for (Contribution contribution : weekContributions) {
            if (contribution.getStudent() == null) continue;
            Integer studentId = contribution.getStudent().getMemberId();
            participantMap.compute(studentId, (id, participant) -> {
                if (participant == null) {
                    Student student = students.stream()
                            .filter(s -> s.getMemberId().equals(id))
                            .findFirst()
                            .orElse(null);
                    return ClassDashboardResponse.RaidParticipant.builder()
                            .studentId(id)
                            .studentName(student != null ? student.getMember().getRealName() : "알 수 없음")
                            .totalDamage(contribution.getDamage() != null ? contribution.getDamage() : 0)
                            .attackCount(1) // Contribution 업데이트 횟수로 계산
                            .build();
                } else {
                    return ClassDashboardResponse.RaidParticipant.builder()
                            .studentId(participant.getStudentId())
                            .studentName(participant.getStudentName())
                            .totalDamage(participant.getTotalDamage() + (contribution.getDamage() != null ? contribution.getDamage() : 0))
                            .attackCount(participant.getAttackCount() + 1)
                            .build();
                }
            });
        }

        List<ClassDashboardResponse.RaidParticipant> raidParticipantsList = participantMap.values().stream()
                .sorted(Comparator.comparing(ClassDashboardResponse.RaidParticipant::getTotalDamage).reversed())
                .limit(5)
                .collect(Collectors.toList());

        // 5. 시간대별 제출 분포
        Map<Integer, Integer> hourlyDistribution = new HashMap<>();
        for (int hour = 0; hour < 24; hour++) {
            hourlyDistribution.put(hour, 0);
        }
        for (Submission submission : weekSubmissions) {
            if (submission.getSubmittedAt() != null) {
                int hour = submission.getSubmittedAt().getHour();
                hourlyDistribution.put(hour, hourlyDistribution.get(hour) + 1);
            }
        }

        List<ClassDashboardResponse.HourlyDistribution> hourlySubmissionDistribution = hourlyDistribution.entrySet().stream()
                .map(entry -> ClassDashboardResponse.HourlyDistribution.builder()
                        .hour(entry.getKey())
                        .count(entry.getValue())
                        .build())
                .sorted(Comparator.comparing(ClassDashboardResponse.HourlyDistribution::getHour))
                .collect(Collectors.toList());

        // 6. 코랄 지급 순위
        Map<Integer, Integer> coralByStudent = weekActionLogs.stream()
                .collect(Collectors.groupingBy(
                        log -> log.getStudent().getMemberId(),
                        Collectors.summingInt(log -> log.getChangeCoral() != null ? log.getChangeCoral() : 0)
                ));

        List<ClassDashboardResponse.CoralRanking> coralRanking = coralByStudent.entrySet().stream()
                .sorted(Map.Entry.<Integer, Integer>comparingByValue().reversed())
                .map(entry -> {
                    Student student = students.stream()
                            .filter(s -> s.getMemberId().equals(entry.getKey()))
                            .findFirst()
                            .orElse(null);
                    return ClassDashboardResponse.CoralRanking.builder()
                            .studentId(entry.getKey())
                            .studentName(student != null ? student.getMember().getRealName() : "알 수 없음")
                            .totalCoral(entry.getValue())
                            .build();
                })
                .collect(Collectors.toList());

        return ClassDashboardResponse.builder()
                .className(classes.getClassName())
                .weeklySummary(ClassDashboardResponse.WeeklySummary.builder()
                        .submissions(submissions)
                        .approvalRate(Math.round(approvalRate * 10.0) / 10.0)
                        .raidAttacks(raidAttacks)
                        .raidParticipants(raidParticipants)
                        .totalCoralRewarded(totalCoralRewarded)
                        .build())
                .questActivityTrend(questActivityTrend)
                .topSubmitters(topSubmitters)
                .raidParticipants(raidParticipantsList)
                .hourlySubmissionDistribution(hourlySubmissionDistribution)
                .coralRanking(coralRanking)
                .researchDataUsage(ClassDashboardResponse.ResearchDataUsage.builder()
                        .totalUsed(totalResearchDataUsed)
                        .averagePerStudent(Math.round(averageResearchDataPerStudent * 10.0) / 10.0)
                        .build())
                .build();
    }
}
