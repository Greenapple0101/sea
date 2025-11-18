package com.example.sca_be.global.security;

import com.example.sca_be.domain.auth.dto.LoginRequest;
import com.example.sca_be.domain.auth.entity.Member;
import com.example.sca_be.domain.auth.entity.Role;
import com.example.sca_be.domain.auth.entity.Student;
import com.example.sca_be.domain.auth.entity.Teacher;
import com.example.sca_be.domain.auth.repository.MemberRepository;
import com.example.sca_be.domain.auth.repository.StudentRepository;
import com.example.sca_be.domain.auth.repository.TeacherRepository;
import com.example.sca_be.domain.classroom.entity.Classes;
import com.example.sca_be.domain.classroom.repository.ClassesRepository;
import com.example.sca_be.global.common.ApiVersion;
import com.example.sca_be.global.security.jwt.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Spring Security 통합 테스트
 * - JWT 인증/인가 전체 플로우 테스트
 * - RBAC (Role-Based Access Control) 검증
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@Transactional
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ClassesRepository classesRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private Member teacherMember;
    private Member studentMember;
    private String teacherToken;
    private String studentToken;
    private Classes testClass;

    @BeforeEach
    void setUp() {
        // 테스트용 반 생성
        testClass = Classes.builder()
                .className("보안테스트반")
                .inviteCode("SEC123")
                .build();
        classesRepository.save(testClass);

        // 선생님 계정 생성
        teacherMember = Member.builder()
                .username("security_teacher")
                .password(passwordEncoder.encode("password"))
                .realName("보안선생")
                .nickname("보안쌤")
                .email("teacher@security.test")
                .role(Role.TEACHER)
                .build();
        memberRepository.save(teacherMember);

        Teacher teacher = Teacher.builder()
                .member(teacherMember)
                .build();
        teacherRepository.save(teacher);

        // 학생 계정 생성
        studentMember = Member.builder()
                .username("security_student")
                .password(passwordEncoder.encode("password"))
                .realName("보안학생")
                .nickname("보안학")
                .email("student@security.test")
                .role(Role.STUDENT)
                .build();
        memberRepository.save(studentMember);

        Student student = Student.builder()
                .member(studentMember)
                .classes(testClass)
                .build();
        studentRepository.save(student);

        // JWT 토큰 생성
        teacherToken = jwtTokenProvider.createToken(teacherMember.getMemberId(), teacherMember.getUsername());
        studentToken = jwtTokenProvider.createToken(studentMember.getMemberId(), studentMember.getUsername());
    }

    @AfterEach
    void tearDown() {
        studentRepository.deleteAll();
        teacherRepository.deleteAll();
        memberRepository.deleteAll();
        classesRepository.deleteAll();
    }

    /*@Test
    @DisplayName("인증 없이 공개 API 접근 성공")
    void accessPublicEndpoint_WithoutAuth_Success() throws Exception {
        // given
        LoginRequest request = LoginRequest.builder()
                .username("security_teacher")
                .password("password")
                .build();

        // when & then
        mockMvc.perform(post(ApiVersion.AUTH + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk());
    }*/

    @Test
    @DisplayName("인증 없이 보호된 API 접근 시 401 Unauthorized")
    void accessProtectedEndpoint_WithoutAuth_Unauthorized() throws Exception {
        // when & then
        mockMvc.perform(get(ApiVersion.CLASSES + "/1"))
                .andDo(print())
                .andExpect(status().isUnauthorized());
    }

    /*@Test
    @DisplayName("유효한 JWT 토큰으로 인증된 요청 성공")
    void accessProtectedEndpoint_WithValidToken_Success() throws Exception {
        // when & then - 실제 존재하는 엔드포인트가 아니므로 401이 아닌 404가 나올 수 있음
        // 하지만 인증은 통과해야 함
        mockMvc.perform(get(ApiVersion.CLASSES + "/1")
                        .header("Authorization", "Bearer " + teacherToken))
                .andDo(print())
                .andExpect(status().isNotFound()); // 엔드포인트가 미구현이므로 404
    }*/

    @Test
    @DisplayName("잘못된 JWT 토큰으로 접근 시 401 Unauthorized")
    void accessProtectedEndpoint_WithInvalidToken_Unauthorized() throws Exception {
        // when & then
        mockMvc.perform(get(ApiVersion.CLASSES + "/1")
                        .header("Authorization", "Bearer invalid.jwt.token"))
                .andDo(print())
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("만료된 JWT 토큰으로 접근 시 401 Unauthorized")
    void accessProtectedEndpoint_WithExpiredToken_Unauthorized() throws Exception {
        // given - 이미 만료된 토큰 생성 (실제 환경에서는 시간이 지나야 만료되지만, 테스트에서는 검증 로직만 확인)
        String expiredToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0IiwibWVtYmVySWQiOjEsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAxfQ.invalid";

        // when & then
        mockMvc.perform(get(ApiVersion.CLASSES + "/1")
                        .header("Authorization", "Bearer " + expiredToken))
                .andDo(print())
                .andExpect(status().isUnauthorized());
    }

    /*@Test
    @DisplayName("RBAC - 선생님 권한으로 선생님 전용 API 접근 성공")
    void accessTeacherEndpoint_WithTeacherRole_Success() throws Exception {
        // when & then - /api/v1/classes/** 는 TEACHER 권한 필요
        mockMvc.perform(get(ApiVersion.CLASSES + "/1")
                        .header("Authorization", "Bearer " + teacherToken))
                .andDo(print())
                .andExpect(status().isNotFound()); // 인증은 통과, 엔드포인트 미구현으로 404
    }*/

    @Test
    @DisplayName("RBAC - 학생 권한으로 선생님 전용 API 접근 시 403 Forbidden")
    void accessTeacherEndpoint_WithStudentRole_Forbidden() throws Exception {
        // when & then - /api/v1/classes/** 는 TEACHER 권한 필요
        mockMvc.perform(get(ApiVersion.CLASSES + "/1")
                        .header("Authorization", "Bearer " + studentToken))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    /*@Test
    @DisplayName("RBAC - 학생 권한으로 학생 전용 API 접근 성공")
    void accessStudentEndpoint_WithStudentRole_Success() throws Exception {
        // when & then - /api/v1/students/** 는 STUDENT 권한 필요
        mockMvc.perform(get(ApiVersion.V1 + "/students/dashboard")
                        .header("Authorization", "Bearer " + studentToken))
                .andDo(print())
                .andExpect(status().isNotFound()); // 인증은 통과, 엔드포인트 미구현으로 404
    }*/

    /*@Test
    @DisplayName("RBAC - 선생님 권한으로 학생 전용 API 접근 시 403 Forbidden")
    void accessStudentEndpoint_WithTeacherRole_Forbidden() throws Exception {
        // when & then - /api/v1/students/** 는 STUDENT 권한 필요
        mockMvc.perform(get(ApiVersion.V1 + "/students/dashboard")
                        .header("Authorization", "Bearer " + teacherToken))
                .andDo(print())
                .andExpect(status().isForbidden());
    }*/

    @Test
    @DisplayName("Authorization 헤더 없이 보호된 API 접근 시 401 Unauthorized")
    void accessProtectedEndpoint_WithoutAuthorizationHeader_Unauthorized() throws Exception {
        // when & then
        mockMvc.perform(get(ApiVersion.CLASSES + "/1"))
                .andDo(print())
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Bearer 접두사 없는 토큰으로 접근 시 401 Unauthorized")
    void accessProtectedEndpoint_WithoutBearerPrefix_Unauthorized() throws Exception {
        // when & then
        mockMvc.perform(get(ApiVersion.CLASSES + "/1")
                        .header("Authorization", teacherToken)) // Bearer 없이
                .andDo(print())
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Swagger UI는 인증 없이 접근 가능")
    void accessSwaggerUI_WithoutAuth_Success() throws Exception {
        // when & then
        mockMvc.perform(get("/swagger-ui/index.html"))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("H2 Console은 Security 필터를 통과함 (개발 환경)")
    void accessH2Console_WithoutAuth_Success() throws Exception {
        // security 통과했는지만 확인
        mockMvc.perform(get("/h2-console/"))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Actuator Health는 인증 없이 접근 가능")
    void accessActuatorHealth_WithoutAuth_Success() throws Exception {
        // when & then
        mockMvc.perform(get("/actuator/health"))
                .andDo(print())
                .andExpect(status().isOk());
    }

    /*@Test
    @DisplayName("CORS - OPTIONS 요청 처리")
    void corsPreflightRequest_Success() throws Exception {
        // when & then
        mockMvc.perform(post(ApiVersion.AUTH + "/login")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk());
    }*/

    /*@Test
    @DisplayName("JWT 토큰으로 인증 후 사용자 정보 확인")
    void authenticateWithJWT_CheckUserDetails() throws Exception {
        // given - 로그인하여 토큰 획득
        LoginRequest loginRequest = LoginRequest.builder()
                .username("security_teacher")
                .password("password")
                .build();

        String response = mockMvc.perform(post(ApiVersion.AUTH + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // then - 응답에서 사용자 정보 확인
        assertThat(response).contains("security_teacher");
        assertThat(response).contains("ROLE_TEACHER");
        assertThat(response).contains("accessToken");
    }*/

    private static org.assertj.core.api.AbstractStringAssert<?> assertThat(String actual) {
        return org.assertj.core.api.Assertions.assertThat(actual);
    }
}