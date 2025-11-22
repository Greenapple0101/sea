package com.example.sca_be.domain.auth.service;

import com.example.sca_be.domain.auth.dto.*;
import com.example.sca_be.domain.auth.entity.Member;
import com.example.sca_be.domain.auth.entity.Role;
import com.example.sca_be.domain.auth.entity.Student;
import com.example.sca_be.domain.auth.entity.Teacher;
import com.example.sca_be.domain.auth.repository.MemberRepository;
import com.example.sca_be.domain.auth.repository.StudentRepository;
import com.example.sca_be.domain.auth.repository.TeacherRepository;
import com.example.sca_be.domain.classroom.entity.Classes;
import com.example.sca_be.domain.classroom.repository.ClassesRepository;
import com.example.sca_be.domain.personalquest.entity.QuestStatus;
import com.example.sca_be.domain.personalquest.repository.QuestAssignmentRepository;
import com.example.sca_be.global.exception.CustomException;
import com.example.sca_be.global.exception.ErrorCode;
import com.example.sca_be.global.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final MemberRepository memberRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final ClassesRepository classesRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final QuestAssignmentRepository questAssignmentRepository;

    // 1. 선생님 회원가입
    @Transactional
    public TeacherSignupResponse teacherSignup(TeacherSignupRequest request) {
        // 중복 검사
        if (memberRepository.existsByUsername(request.getUsername())) {
            throw new CustomException(ErrorCode.DUPLICATE_USERNAME);
        }
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        }
        if(memberRepository.existsByNickname(request.getNickname())) {
            throw new CustomException(ErrorCode.DUPLICATE_NICKNAME);
        }

        // Member 생성
        Member member = Member.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .realName(request.getRealName())
                .nickname(request.getNickname())
                .email(request.getEmail())
                .role(Role.TEACHER)
                .build();

        Member savedMember = memberRepository.save(member);

        // Teacher 생성
        Teacher teacher = Teacher.builder()
                .member(savedMember)
                .build();

        teacherRepository.save(teacher);

        return TeacherSignupResponse.builder()
                .teacherId(teacher.getMemberId())
                .username(savedMember.getUsername())
                .email(savedMember.getEmail())
                .realName(savedMember.getRealName())
                .nickname(savedMember.getNickname())
                .role("ROLE_" + savedMember.getRole().name())
                .createdAt(savedMember.getCreatedAt())
                .build();
    }

    // 2. 학생 회원가입
    @Transactional
    public StudentSignupResponse studentSignup(StudentSignupRequest request) {

        if(memberRepository.existsByUsername(request.getUsername())) {
            throw new CustomException(ErrorCode.DUPLICATE_USERNAME);
        }

        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        }
        if(memberRepository.existsByNickname(request.getNickname())) {
            throw new CustomException(ErrorCode.DUPLICATE_NICKNAME);
        }

        // 초대 코드로 반 찾기
        Classes classes = classesRepository.findByInviteCode(request.getInviteCode())
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_INVITE_CODE));

        // Member 생성
        Member member = Member.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .realName(request.getRealName())
                .nickname(request.getNickname() != null ? request.getNickname() : request.getRealName())
                .email(request.getEmail() != null ? request.getEmail() : "")
                .role(Role.STUDENT)
                .build();

        Member savedMember = memberRepository.save(member);

        // Student 생성
        Student student = Student.builder()
                .member(savedMember)
                .classes(classes)
                .build();

        studentRepository.save(student);

        return StudentSignupResponse.builder()
                .studentId(student.getMemberId())
                .username(savedMember.getUsername())
                .realName(savedMember.getRealName())
                .nickname(savedMember.getNickname())
                .email(savedMember.getEmail())
                .classId(classes.getClassId())
                .className(classes.getClassName())
                .role("ROLE_" + savedMember.getRole().name())
                .coral(student.getCoral() != null ? student.getCoral() : 0)
                .researchData(student.getResearchData() != null ? student.getResearchData() : 0)
                .createdAt(savedMember.getCreatedAt())
                .build();
    }

    // 3. 로그인
    @Transactional
    public Object login(LoginRequest request) {
        // 사용자 조회
        Member member = memberRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));

        // 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_CREDENTIALS);
        }

        // 토큰 생성
        String accessToken = jwtTokenProvider.createToken(member.getMemberId(), member.getUsername());
        String refreshToken = jwtTokenProvider.createRefreshToken(member.getMemberId(), member.getUsername());
        long expiresIn = jwtTokenProvider.getExpirationTime();

        // Role에 따라 다른 응답 반환
        if (member.getRole() == Role.TEACHER) {
            Teacher teacher = teacherRepository.findById(member.getMemberId())
                    .orElseThrow(() -> new CustomException(ErrorCode.TEACHER_NOT_FOUND));
            return TeacherLoginResponse.builder()
                    .userType("teacher")
                    .teacherId(teacher.getMemberId())
                    .username(member.getUsername())
                    .email(member.getEmail())
                    .realName(member.getRealName())
                    .nickname(member.getNickname())
                    .role("ROLE_" + member.getRole().name())
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(expiresIn)
                    .build();
        } else {
            // classes를 함께 조회하여 LazyInitializationException 방지
            Student student = studentRepository.findByIdWithClasses(member.getMemberId())
                    .orElseThrow(() -> new CustomException(ErrorCode.STUDENT_NOT_FOUND));
            Classes classes = student.getClasses();
            return StudentLoginResponse.builder()
                    .userType("student")
                    .studentId(student.getMemberId())
                    .username(member.getUsername())
                    .realName(member.getRealName())
                    .nickname(member.getNickname())
                    .email(member.getEmail())
                    .classId(classes != null ? classes.getClassId() : null)
                    .className(classes != null ? classes.getClassName() : null)
                    .coral(student.getCoral() != null ? student.getCoral() : 0)
                    .researchData(student.getResearchData() != null ? student.getResearchData() : 0)
                    .role("ROLE_" + member.getRole().name())
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(expiresIn)
                    .build();
        }
    }

    // 4. 토큰 갱신
    @Transactional
    public TokenResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        // Refresh Token 유효성 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new CustomException(ErrorCode.TOKEN_EXPIRED, "유효하지 않거나 만료된 리프레시 토큰입니다.");
        }

        // Refresh Token에서 username 추출
        String username = jwtTokenProvider.getUsername(refreshToken);

        // 사용자 조회
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 새 토큰 발급
        String newAccessToken = jwtTokenProvider.createToken(member.getMemberId(), member.getUsername());
        String newRefreshToken = jwtTokenProvider.createRefreshToken(member.getMemberId(), member.getUsername());
        long expiresIn = jwtTokenProvider.getExpirationTime();

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .build();
    }

    // 5. 학생 프로필 조회
    public StudentProfileResponse getStudentProfile(Integer studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new CustomException(ErrorCode.STUDENT_NOT_FOUND));

        Classes classes = student.getClasses();

        // 승인된 퀘스트들의 보상 합계 계산
        List<com.example.sca_be.domain.personalquest.entity.QuestAssignment> approvedQuests = 
            questAssignmentRepository.findByStudentAndStatusIn(
                studentId, 
                Arrays.asList(QuestStatus.APPROVED)
            );

        System.out.println("학생 프로필 조회 - 학생 ID: " + studentId + ", 승인된 퀘스트 수: " + approvedQuests.size());
        for (com.example.sca_be.domain.personalquest.entity.QuestAssignment qa : approvedQuests) {
            System.out.println("  - Assignment ID: " + qa.getAssignmentId() + 
                             ", 코랄: " + qa.getRewardCoralPersonal() + 
                             ", 탐사데이터: " + qa.getRewardResearchDataPersonal());
        }

        int totalEarnedCoral = approvedQuests.stream()
            .mapToInt(qa -> qa.getRewardCoralPersonal() != null ? qa.getRewardCoralPersonal() : 0)
            .sum();

        int totalEarnedResearchData = approvedQuests.stream()
            .mapToInt(qa -> qa.getRewardResearchDataPersonal() != null ? qa.getRewardResearchDataPersonal() : 0)
            .sum();
        
        System.out.println("총 획득 코랄: " + totalEarnedCoral + ", 총 획득 탐사데이터: " + totalEarnedResearchData);
        System.out.println("현재 보유 코랄: " + (student.getCoral() != null ? student.getCoral() : 0) + 
                         ", 현재 보유 탐사데이터: " + (student.getResearchData() != null ? student.getResearchData() : 0));

        return StudentProfileResponse.builder()
                .studentId(student.getMemberId())
                .username(student.getMember().getUsername())
                .realName(student.getMember().getRealName())
                .nickname(student.getMember().getNickname())
                .email(student.getMember().getEmail())
                .classId(classes != null ? classes.getClassId() : null)
                .className(classes != null ? classes.getClassName() : null)
                .coral(student.getCoral() != null ? student.getCoral() : 0)
                .researchData(student.getResearchData() != null ? student.getResearchData() : 0)
                .totalEarnedCoral(totalEarnedCoral)
                .totalEarnedResearchData(totalEarnedResearchData)
                .build();
    }

    // 5. 로그아웃 (현재는 클라이언트에서 토큰 삭제만 하면 됨)
    @Transactional
    public void logout(LogoutRequest request) {
        // 추후 Refresh Token을 Redis나 DB에 저장하는 경우 여기서 삭제
        // 현재는 클라이언트 측에서 토큰 삭제만 하면 되므로 별도 로직 없음
    }
}