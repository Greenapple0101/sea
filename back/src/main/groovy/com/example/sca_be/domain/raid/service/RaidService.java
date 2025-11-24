package com.example.sca_be.domain.raid.service;

import com.example.sca_be.domain.auth.entity.Student;
import com.example.sca_be.domain.auth.entity.Teacher;
import com.example.sca_be.domain.auth.repository.StudentRepository;
import com.example.sca_be.domain.auth.repository.TeacherRepository;
import com.example.sca_be.domain.classroom.entity.Classes;
import com.example.sca_be.domain.classroom.repository.ClassesRepository;
import com.example.sca_be.domain.raid.dto.*;
import com.example.sca_be.domain.raid.entity.Contribution;
import com.example.sca_be.domain.raid.entity.Difficulty;
import com.example.sca_be.domain.raid.entity.Raid;
import com.example.sca_be.domain.raid.entity.RaidStatus;
import com.example.sca_be.domain.raid.entity.RaidTemplate;
import com.example.sca_be.domain.raid.repository.ContributionRepository;
import com.example.sca_be.domain.raid.repository.RaidRepository;
import com.example.sca_be.global.exception.CustomException;
import com.example.sca_be.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RaidService {

    private final RaidRepository raidRepository;
    private final ContributionRepository contributionRepository;
    private final StudentRepository studentRepository;
    private final ClassesRepository classesRepository;
    private final TeacherRepository teacherRepository;

    /**
     * 학생의 레이드 정보 조회
     */
    @Transactional
    public StudentRaidResponse getMyRaid(Integer studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new CustomException(ErrorCode.STUDENT_NOT_FOUND));

        // 학생이 속한 반의 활성 레이드 조회
        if (student.getClasses() == null) {
            throw new CustomException(ErrorCode.CLASS_NOT_FOUND);
        }

        Raid activeRaid = raidRepository.findByClasses_ClassIdAndStatus(
                student.getClasses().getClassId(),
                RaidStatus.ACTIVE
        ).orElse(null);

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

        // 활성 레이드가 없으면 null 반환 (프론트엔드에서 처리)
        if (activeRaid == null) {
            return null;
        }

        // 학생의 기여도 조회
        Contribution contribution = contributionRepository.findByRaidAndStudent(activeRaid, student)
                .orElse(null);

        Integer myTotalContribution = contribution != null && contribution.getDamage() != null
                ? contribution.getDamage()
                : 0;

        // 학생의 남은 탐사데이터
        Integer remainingResearchData = student.getResearchData() != null ? student.getResearchData() : 0;

        // HP 정보 생성
        long totalBossHp = activeRaid.getTotalBossHp() != null ? activeRaid.getTotalBossHp() : 0L;
        long currentBossHp = activeRaid.getCurrentBossHp() != null ? activeRaid.getCurrentBossHp() : totalBossHp;
        int bossHpPercentage = (totalBossHp > 0)
                ? (int) Math.max(0, Math.min(100, Math.round((double) currentBossHp * 100 / totalBossHp)))
                : 0;

        StudentRaidResponse.BossHp bossHp = StudentRaidResponse.BossHp.builder()
                .total(totalBossHp)
                .current(currentBossHp)
                .percentage(bossHpPercentage)
                .build();

        // 참가 인원 수
        int participants = contributionRepository.countByRaid(activeRaid);

        // 남은 시간 출력 형태
        String remainingTimeText = formatRemainingTime(activeRaid.getEndDate());
        String endDateText = activeRaid.getEndDate() != null
                ? activeRaid.getEndDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                : null;

        StudentRaidResponse.MyContribution myContribution = StudentRaidResponse.MyContribution.builder()
                .totalDamage(myTotalContribution)
                .lastAttackAt(null) // 추후 로그 테이블 연동 시 갱신
                .build();

        return StudentRaidResponse.builder()
                .raidId(activeRaid.getRaidId())
                .classId(activeRaid.getClasses().getClassId())
                .className(activeRaid.getClasses().getClassName())
                .raidName(activeRaid.getRaidName())
                .template(activeRaid.getBossType() != null ? activeRaid.getBossType().name() : null)
                .templateName(activeRaid.getBossType() != null ? activeRaid.getBossType().getDisplayName() : null)
                .difficulty(activeRaid.getDifficulty() != null ? activeRaid.getDifficulty().name() : null)
                .status(activeRaid.getStatus() != null ? activeRaid.getStatus().name() : null)
                .bossHp(bossHp)
                .endDate(endDateText)
                .remainingTime(remainingTimeText)
                .rewardCoral(activeRaid.getRewardCoral())
                .participants(participants)
                .specialRewardDescription(activeRaid.getSpecialRewardDescription())
                .myContribution(myContribution)
                .myResearchData(remainingResearchData)
                .build();
    }

    /**
     * 레이드 생성 정보 조회
     */
    @Transactional
    public RaidCreationInfoResponse getCreationInfo(Integer classId, Integer teacherId) {
        Classes classes = classesRepository.findById(classId)
                .orElseThrow(() -> new CustomException(ErrorCode.CLASS_NOT_FOUND));
        
        // 반 소유권 확인
        if (!classes.getTeacher().getMemberId().equals(teacherId)) {
            throw new CustomException(ErrorCode.CLASS_ACCESS_DENIED);
        }

        // 학생 수 조회
        int studentCount = studentRepository.countByClasses(classes);

        // 활성 레이드 조회
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

        // 템플릿 목록 생성
        List<RaidCreationInfoResponse.Template> templates = Arrays.stream(RaidTemplate.values())
                .map(template -> RaidCreationInfoResponse.Template.builder()
                        .code(template.name())
                        .displayName(template.getDisplayName())
                        .description(template.getDescription())
                        .build())
                .collect(Collectors.toList());

        // 난이도 옵션 생성 (프론트엔드에서 사용하는 HP 범위 사용)
        List<RaidCreationInfoResponse.DifficultyOption> difficultyOptions = List.of(
                RaidCreationInfoResponse.DifficultyOption.builder()
                        .code("LOW")
                        .displayName("하 난이도 (Easy)")
                        .hp(33000L) // 중간값
                        .minHp(30000L)
                        .maxHp(36000L)
                        .build(),
                RaidCreationInfoResponse.DifficultyOption.builder()
                        .code("MEDIUM")
                        .displayName("중 난이도 (Normal)")
                        .hp(42000L) // 중간값
                        .minHp(38000L)
                        .maxHp(46000L)
                        .build(),
                RaidCreationInfoResponse.DifficultyOption.builder()
                        .code("HIGH")
                        .displayName("상 난이도 (Hard)")
                        .hp(52000L) // 중간값
                        .minHp(48000L)
                        .maxHp(56000L)
                        .build()
        );

        // 활성 레이드 정보
        RaidCreationInfoResponse.ActiveRaid activeRaidInfo = null;
        if (activeRaid != null) {
            activeRaidInfo = RaidCreationInfoResponse.ActiveRaid.builder()
                    .raidId(activeRaid.getRaidId())
                    .raidName(activeRaid.getRaidName())
                    .status(activeRaid.getStatus() != null ? activeRaid.getStatus().name() : "")
                    .currentHp(activeRaid.getCurrentBossHp())
                    .totalHp(activeRaid.getTotalBossHp())
                    .endDate(activeRaid.getEndDate())
                    .build();
        }

        return RaidCreationInfoResponse.builder()
                .classInfo(RaidCreationInfoResponse.ClassInfo.builder()
                        .classId(classes.getClassId())
                        .className(classes.getClassName())
                        .studentCount(studentCount)
                        .build())
                .templates(templates)
                .difficultyOptions(difficultyOptions)
                .activeRaid(activeRaidInfo)
                .build();
    }

    /**
     * 레이드 생성
     */
    @Transactional
    public RaidDetailResponse createRaid(Integer teacherId, RaidCreateRequest request) {
        // 반 조회 및 권한 확인
        Classes classes = classesRepository.findById(request.getClassId())
                .orElseThrow(() -> new CustomException(ErrorCode.CLASS_NOT_FOUND));

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new CustomException(ErrorCode.TEACHER_NOT_FOUND));

        // 반 소유권 확인
        if (!classes.getTeacher().getMemberId().equals(teacherId)) {
            throw new CustomException(ErrorCode.CLASS_ACCESS_DENIED);
        }

        // 이미 활성 레이드가 있는지 확인
        Raid activeRaid = raidRepository.findByClasses_ClassIdAndStatus(
                request.getClassId(),
                RaidStatus.ACTIVE
        ).orElse(null);

        if (activeRaid != null) {
            throw new CustomException(ErrorCode.ALREADY_SUBMITTED, "이미 진행 중인 레이드가 있습니다.");
        }

        // 템플릿 검증
        RaidTemplate template;
        try {
            template = RaidTemplate.valueOf(request.getTemplate());
        } catch (IllegalArgumentException e) {
            throw new CustomException(ErrorCode.INVALID_INPUT, "유효하지 않은 템플릿입니다.");
        }

        // 난이도 검증
        Difficulty difficulty;
        try {
            difficulty = Difficulty.valueOf(request.getDifficulty());
        } catch (IllegalArgumentException e) {
            throw new CustomException(ErrorCode.INVALID_INPUT, "유효하지 않은 난이도입니다.");
        }

        // 날짜 검증
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new CustomException(ErrorCode.INVALID_INPUT, "시작 일시는 종료 일시보다 빨라야 합니다.");
        }

        if (request.getStartDate().isBefore(LocalDateTime.now())) {
            throw new CustomException(ErrorCode.INVALID_INPUT, "시작 일시는 현재 시간보다 빨라야 합니다.");
        }

        // 레이드 생성
        Raid raid = Raid.builder()
                .raidName(request.getRaidName())
                .teacher(teacher)
                .classes(classes)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalBossHp(request.getBossHp())
                .currentBossHp(request.getBossHp())
                .rewardCoral(request.getRewardCoral())
                .specialRewardDescription(request.getSpecialRewardDescription())
                .status(RaidStatus.ACTIVE)
                .difficulty(difficulty)
                .bossType(template)
                .build();

        Raid savedRaid = raidRepository.save(raid);

        // 남은 시간 계산
        Long remainingSeconds = 0L;
        if (savedRaid.getEndDate() != null) {
            LocalDateTime now = LocalDateTime.now();
            if (now.isBefore(savedRaid.getEndDate())) {
                remainingSeconds = Duration.between(now, savedRaid.getEndDate()).getSeconds();
            }
        }

        // 진행률 계산
        int progressPercent = 100;
        if (savedRaid.getTotalBossHp() != null && savedRaid.getTotalBossHp() > 0) {
            progressPercent = (int) ((savedRaid.getCurrentBossHp() * 100) / savedRaid.getTotalBossHp());
        }

        return RaidDetailResponse.builder()
                .raidId(savedRaid.getRaidId())
                .classId(savedRaid.getClasses().getClassId())
                .className(savedRaid.getClasses().getClassName())
                .raidName(savedRaid.getRaidName())
                .template(savedRaid.getBossType() != null ? savedRaid.getBossType().name() : "")
                .difficulty(savedRaid.getDifficulty() != null ? savedRaid.getDifficulty().name() : "")
                .status(savedRaid.getStatus() != null ? savedRaid.getStatus().name() : "")
                .startDate(savedRaid.getStartDate())
                .endDate(savedRaid.getEndDate())
                .totalBossHp(savedRaid.getTotalBossHp())
                .currentBossHp(savedRaid.getCurrentBossHp())
                .progressPercent(progressPercent)
                .rewardCoral(savedRaid.getRewardCoral())
                .specialRewardDescription(savedRaid.getSpecialRewardDescription())
                .participantCount(0)
                .remainingSeconds(remainingSeconds)
                .contributions(new ArrayList<>())
                .build();
    }


    /**
     * 레이드 상세 조회 (선생님용)
     */
    public RaidDetailResponse getRaidDetail(Integer raidId, Integer teacherId) {
        Raid raid = raidRepository.findById(raidId)
                .orElseThrow(() -> new CustomException(ErrorCode.RAID_NOT_FOUND));

        // 선생님 권한 확인
        if (!raid.getTeacher().getMemberId().equals(teacherId)) {
            throw new CustomException(ErrorCode.CLASS_ACCESS_DENIED);
        }

        // 남은 시간 계산
        Long remainingSeconds = 0L;
        if (raid.getEndDate() != null) {
            LocalDateTime now = LocalDateTime.now();
            if (now.isBefore(raid.getEndDate())) {
                remainingSeconds = Duration.between(now, raid.getEndDate()).getSeconds();
            }
        }

        // 진행률 계산
        int progressPercent = 100;
        if (raid.getTotalBossHp() != null && raid.getTotalBossHp() > 0) {
            progressPercent = (int) ((raid.getCurrentBossHp() * 100) / raid.getTotalBossHp());
        }

        // 참여자 수 조회
        int participantCount = contributionRepository.countByRaid(raid);

        // 기여도 목록 조회 (상위 10명)
        List<Contribution> topContributions = contributionRepository.findByRaidOrderByDamageDesc(raid)
                .stream()
                .limit(10)
                .collect(Collectors.toList());

        // 총 데미지 계산 (기여도 퍼센트 계산용)
        long totalDamage = topContributions.stream()
                .mapToLong(c -> c.getDamage() != null ? c.getDamage() : 0L)
                .sum();

        List<RaidDetailResponse.ContributionInfo> contributions = topContributions.stream()
                .map(c -> {
                    double contributionPercent = 0.0;
                    if (totalDamage > 0 && c.getDamage() != null) {
                        contributionPercent = (c.getDamage() * 100.0) / totalDamage;
                    }
                    return RaidDetailResponse.ContributionInfo.builder()
                            .studentId(c.getStudent().getMemberId())
                            .studentName(c.getStudent().getMember().getRealName())
                            .damage(c.getDamage() != null ? c.getDamage().longValue() : 0L)
                            .contributionPercent(contributionPercent)
                            .build();
                })
                .collect(Collectors.toList());

        return RaidDetailResponse.builder()
                .raidId(raid.getRaidId())
                .classId(raid.getClasses().getClassId())
                .className(raid.getClasses().getClassName())
                .raidName(raid.getRaidName())
                .template(raid.getBossType() != null ? raid.getBossType().name() : "")
                .difficulty(raid.getDifficulty() != null ? raid.getDifficulty().name() : "")
                .status(raid.getStatus() != null ? raid.getStatus().name() : "")
                .startDate(raid.getStartDate())
                .endDate(raid.getEndDate())
                .totalBossHp(raid.getTotalBossHp())
                .currentBossHp(raid.getCurrentBossHp())
                .progressPercent(progressPercent)
                .rewardCoral(raid.getRewardCoral())
                .specialRewardDescription(raid.getSpecialRewardDescription())
                .participantCount(participantCount)
                .remainingSeconds(remainingSeconds)
                .contributions(contributions)
                .build();
    }

    /**
     * 레이드 강제 종료 (선생님용)
     */
    @Transactional
    public RaidTerminateResponse terminateRaid(Integer raidId, Integer teacherId) {
        Raid raid = raidRepository.findById(raidId)
                .orElseThrow(() -> new CustomException(ErrorCode.RAID_NOT_FOUND));

        // 선생님 권한 확인
        if (!raid.getTeacher().getMemberId().equals(teacherId)) {
            throw new CustomException(ErrorCode.CLASS_ACCESS_DENIED);
        }

        // 활성 레이드만 종료 가능
        if (raid.getStatus() != RaidStatus.ACTIVE) {
            throw new CustomException(ErrorCode.INVALID_INPUT, "활성 레이드만 종료할 수 있습니다.");
        }

        raid.terminate();
        raidRepository.save(raid);

        return RaidTerminateResponse.builder()
                .raidId(raid.getRaidId())
                .status(raid.getStatus().name())
                .message("레이드가 종료되었습니다.")
                .build();
    }

    /**
     * 레이드 공격 (학생용)
     */
    @Transactional
    public RaidAttackResponse attackRaid(Integer raidId, Integer studentId, RaidAttackRequest request) {
        Raid raid = raidRepository.findById(raidId)
                .orElseThrow(() -> new CustomException(ErrorCode.RAID_NOT_FOUND));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new CustomException(ErrorCode.STUDENT_NOT_FOUND));

        // 활성 레이드만 공격 가능
        if (raid.getStatus() != RaidStatus.ACTIVE) {
            throw new CustomException(ErrorCode.INVALID_INPUT, "활성 레이드만 공격할 수 있습니다.");
        }

        // 학생이 해당 반에 속해있는지 확인
        if (student.getClasses() == null || !student.getClasses().getClassId().equals(raid.getClasses().getClassId())) {
            throw new CustomException(ErrorCode.CLASS_ACCESS_DENIED);
        }

        // 탐사데이터 확인
        Integer currentResearchData = student.getResearchData() != null ? student.getResearchData() : 0;
        if (currentResearchData < request.getResearchDataAmount()) {
            throw new CustomException(ErrorCode.INSUFFICIENT_RESEARCH_DATA);
        }

        // 탐사데이터 차감
        student.deductResearchData(request.getResearchDataAmount());

        // 보스 HP 감소
        Long bossHpBefore = raid.getCurrentBossHp();
        raid.decreaseBossHp(request.getTotalDamage());
        Long bossHpAfter = raid.getCurrentBossHp();

        // 레이드 완료 여부 확인
        boolean raidCompleted = raid.getCurrentBossHp() <= 0;
        if (raidCompleted) {
            raid.markCompleted();
            // 보상 지급 (코랄만 지급)
            student.addCoral(raid.getRewardCoral());
        }

        // 기여도 업데이트 또는 생성 (Contribution 테이블에 저장)
        Contribution contribution = contributionRepository.findByRaidAndStudent(raid, student)
                .orElse(null);
        if (contribution == null) {
            contribution = Contribution.builder()
                    .raid(raid)
                    .student(student)
                    .damage(request.getTotalDamage())
                    .build();
            contributionRepository.save(contribution);
        } else {
            contribution.addDamage(request.getTotalDamage());
            contributionRepository.save(contribution);
        }

        // 남은 탐사데이터 계산
        Integer remainingResearchData = student.getResearchData() != null ? student.getResearchData() : 0;

        // 총 데미지 계산
        Integer totalDamage = contribution.getDamage();

        // 보스 HP 퍼센트 계산
        int bossHpPercentage = 0;
        if (raid.getTotalBossHp() != null && raid.getTotalBossHp() > 0) {
            bossHpPercentage = (int) ((raid.getCurrentBossHp() * 100) / raid.getTotalBossHp());
        }

        // 응답 생성
        RaidAttackResponse.BossHp bossHp = RaidAttackResponse.BossHp.builder()
                .before(bossHpBefore)
                .after(bossHpAfter)
                .percentage(bossHpPercentage)
                .build();

        RaidAttackResponse.MyStats myStats = RaidAttackResponse.MyStats.builder()
                .totalDamage(totalDamage)
                .remainingResearchData(remainingResearchData)
                .build();

        // 레이드 완료 시 보상 추가 (코랄만 지급)
        RaidAttackResponse.Rewards rewards = null;
        if (raidCompleted) {
            rewards = RaidAttackResponse.Rewards.builder()
                    .coral(raid.getRewardCoral())
                    .researchData(null) // 레이드 보상에 탐사데이터 없음
                    .build();
        }

        // Contribution의 contributionId를 attackLogId로 사용 (RaidLog 테이블 없음)
        RaidAttackResponse response = RaidAttackResponse.builder()
                .raidId(raid.getRaidId())
                .attackLogId(contribution.getContributionId().longValue()) // Contribution ID 사용
                .researchDataUsed(request.getResearchDataAmount())
                .damageDealt(request.getTotalDamage())
                .bossHp(bossHp)
                .raidCompleted(raidCompleted)
                .rewards(rewards)
                .myStats(myStats)
                .attackedAt(LocalDateTime.now())
                .build();

        return response;
    }

    /**
     * 레이드 로그 조회 (Contribution 테이블 기반)
     */
    public RaidLogResponse getRaidLogs(Integer raidId, int page, int size) {
        Raid raid = raidRepository.findById(raidId)
                .orElseThrow(() -> new CustomException(ErrorCode.RAID_NOT_FOUND));

        Pageable pageable = PageRequest.of(page, size);
        // Contribution 테이블의 damage 기준으로 정렬하여 조회
        Page<Contribution> contributionPage = contributionRepository.findByRaidOrderByDamageDesc(raid, pageable);

        List<RaidLogResponse.RaidLogItem> logs = contributionPage.getContent().stream()
                .map(contribution -> {
                    String studentName = contribution.getStudent() != null 
                            ? contribution.getStudent().getMember().getRealName() 
                            : "알 수 없음";
                    // last_attack_at이 없으므로 Raid의 생성 시간 사용
                    LocalDateTime attackTime = contribution.getRaid().getCreatedAt() != null 
                            ? contribution.getRaid().getCreatedAt() 
                            : LocalDateTime.now();
                    String timeAgo = calculateTimeAgo(attackTime);

                    return RaidLogResponse.RaidLogItem.builder()
                            .logId(contribution.getContributionId().longValue()) // Contribution ID 사용
                            .studentName(studentName)
                            .damage(contribution.getDamage())
                            .timestamp(attackTime)
                            .timeAgo(timeAgo)
                            .build();
                })
                .collect(Collectors.toList());

        return RaidLogResponse.builder()
                .logs(logs)
                .totalCount(contributionPage.getTotalElements())
                .page(page)
                .size(size)
                .build();
    }

    /**
     * 레이드 목록 조회 (선생님용)
     */
    public RaidListResponse getRaids(Integer teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new CustomException(ErrorCode.TEACHER_NOT_FOUND));

        // 선생님이 생성한 모든 레이드 조회
        List<Raid> raids = raidRepository.findByTeacher_MemberIdOrderByCreatedAtDesc(teacherId);

        List<RaidListResponse.RaidSummary> raidSummaries = raids.stream()
                .map(raid -> {
                    int participantCount = contributionRepository.countByRaid(raid);

                    return RaidListResponse.RaidSummary.builder()
                            .raidId(raid.getRaidId())
                            .classId(raid.getClasses().getClassId())
                            .className(raid.getClasses().getClassName())
                            .raidName(raid.getRaidName())
                            .status(raid.getStatus() != null ? raid.getStatus().name() : "")
                            .difficulty(raid.getDifficulty() != null ? raid.getDifficulty().name() : "")
                            .currentBossHp(raid.getCurrentBossHp())
                            .totalBossHp(raid.getTotalBossHp())
                            .participantCount(participantCount)
                            .endDate(raid.getEndDate())
                            .build();
                })
                .collect(Collectors.toList());

        return RaidListResponse.builder()
                .raids(raidSummaries)
                .totalCount(raidSummaries.size())
                .build();
    }

    private String formatRemainingTime(LocalDateTime endDate) {
        if (endDate == null) {
            return "";
        }

        LocalDateTime now = LocalDateTime.now();
        if (!now.isBefore(endDate)) {
            return "00:00:00";
        }

        Duration duration = Duration.between(now, endDate);
        long days = duration.toDays();
        duration = duration.minusDays(days);
        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();
        long seconds = duration.toSecondsPart();

        if (days > 0) {
            return String.format("%d일 %02d:%02d:%02d", days, hours, minutes, seconds);
        }
        return String.format("%02d:%02d:%02d", hours, minutes, seconds);
    }

    /**
     * 시간 차이 계산 (예: "2분 전")
     */
    private String calculateTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "알 수 없음";
        }

        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(dateTime, now);

        long seconds = duration.getSeconds();
        if (seconds < 60) {
            return seconds + "초 전";
        }

        long minutes = seconds / 60;
        if (minutes < 60) {
            return minutes + "분 전";
        }

        long hours = minutes / 60;
        if (hours < 24) {
            return hours + "시간 전";
        }

        long days = hours / 24;
        if (days < 30) {
            return days + "일 전";
        }

        long months = days / 30;
        if (months < 12) {
            return months + "개월 전";
        }

        long years = months / 12;
        return years + "년 전";
    }
}
