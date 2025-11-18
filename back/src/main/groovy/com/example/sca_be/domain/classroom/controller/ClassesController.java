package com.example.sca_be.domain.classroom.controller;

import com.example.sca_be.domain.classroom.dto.ClassDetailResponse;
import com.example.sca_be.domain.classroom.dto.ClassDashboardResponse;
import com.example.sca_be.domain.classroom.dto.ClassListResponse;
import com.example.sca_be.domain.classroom.dto.CreateClassRequest;
import com.example.sca_be.domain.classroom.dto.CreateClassResponse;
import com.example.sca_be.domain.classroom.dto.StudentListResponse;
import com.example.sca_be.domain.classroom.service.ClassesService;
import com.example.sca_be.global.common.ApiResponse;
import com.example.sca_be.global.common.ApiVersion;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiVersion.CLASSES)
@RequiredArgsConstructor
public class ClassesController {

    private final ClassesService classesService;

    /**
     * 1. 반 목록 조회 (선생님용 대시보드)
     * GET /api/classes
     */
    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<ClassListResponse>> getClassList() {
        ClassListResponse response = classesService.getClassList();

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(response));
    }

    /**
     * 2. 반 생성
     * POST /api/classes
     */
    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<CreateClassResponse>> createClass(
            @Valid @RequestBody CreateClassRequest request) {

        CreateClassResponse response = classesService.createClass(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("반이 생성되었습니다.", response));
    }

    /**
     * 3. 반 상세 조회 (선생님 반 관리 페이지)
     * GET /api/classes/{classId}
     */
    @GetMapping("/{classId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<ClassDetailResponse>> getClassDetail(
            @PathVariable("classId") Integer classId) {

        ClassDetailResponse response = classesService.getClassDetail(classId);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(response));
    }

    /**
     * 4. 학생 목록 조회
     * GET /api/classes/{classId}/students
     */
    @GetMapping("/{classId}/students")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<StudentListResponse>> getStudentList(
            @PathVariable("classId") Integer classId) {

        StudentListResponse response = classesService.getStudentList(classId);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(response));
    }

    /**
     * 5. 반 활동 대시보드 데이터 조회
     * GET /api/classes/{classId}/dashboard
     */
    @GetMapping("/{classId}/dashboard")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<ClassDashboardResponse>> getClassDashboard(
            @PathVariable("classId") Integer classId) {

        ClassDashboardResponse response = classesService.getClassDashboard(classId);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(response));
    }
}
