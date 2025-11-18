package com.example.sca_be.domain.raid.controller;

import com.example.sca_be.domain.raid.dto.*;
import com.example.sca_be.domain.raid.service.RaidService;
import com.example.sca_be.global.response.ApiResponse;
import com.example.sca_be.global.security.principal.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/raids")
@RequiredArgsConstructor
public class RaidController {

    private final RaidService raidService;

    /**
     * 학생의 레이드 정보 조회
     */
    @GetMapping("/my-raid")
    public ResponseEntity<ApiResponse<StudentRaidResponse>> getMyRaid(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Integer studentId = userDetails.getMemberId();
        
        StudentRaidResponse response = raidService.getMyRaid(studentId);
        
        // 레이드가 없으면 404 반환
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 레이드 생성 정보 조회 (선생님용)
     */
    @GetMapping("/creation-info")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<RaidCreationInfoResponse>> getCreationInfo(
            @RequestParam("class_id") Integer classId,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Integer teacherId = userDetails.getMemberId();
        // 선생님만 접근 가능 (SecurityConfig에서 이미 설정됨)
        
        RaidCreationInfoResponse response = raidService.getCreationInfo(classId, teacherId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 레이드 생성 (선생님용)
     */
    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<RaidDetailResponse>> createRaid(
            @Valid @RequestBody RaidCreateRequest request,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Integer teacherId = userDetails.getMemberId();
        
        RaidDetailResponse response = raidService.createRaid(teacherId, request);
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "레이드가 생성되었습니다."));
    }

    /**
     * 레이드 목록 조회 (선생님용)
     */
    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<RaidListResponse>> getRaids(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Integer teacherId = userDetails.getMemberId();

        RaidListResponse response = raidService.getRaids(teacherId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 레이드 상세 조회 (선생님용)
     */
    @GetMapping("/{raidId}/detail")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<RaidDetailResponse>> getRaidDetail(
            @PathVariable("raidId") Integer raidId,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Integer teacherId = userDetails.getMemberId();

        RaidDetailResponse response = raidService.getRaidDetail(raidId, teacherId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 레이드 강제 종료 (선생님용)
     */
    @PostMapping("/{raidId}/terminate")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<RaidTerminateResponse>> terminateRaid(
            @PathVariable("raidId") Integer raidId,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Integer teacherId = userDetails.getMemberId();

        RaidTerminateResponse response = raidService.terminateRaid(raidId, teacherId);
        return ResponseEntity.ok(ApiResponse.success(response, "레이드가 종료되었습니다."));
    }

    /**
     * 레이드 공격 (학생용)
     */
    @PostMapping("/{raidId}/attack")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<RaidAttackResponse>> attackRaid(
            @PathVariable("raidId") Integer raidId,
            @Valid @RequestBody RaidAttackRequest request,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Integer studentId = userDetails.getMemberId();

        RaidAttackResponse response = raidService.attackRaid(raidId, studentId, request);

        String message = response.getRaidCompleted()
                ? "보스를 처치했습니다! 레이드가 완료되었습니다!"
                : "에너지를 주입했습니다!";

        return ResponseEntity.ok(ApiResponse.success(response, message));
    }

    /**
     * 레이드 로그 조회
     */
    @GetMapping("/{raidId}/logs")
    public ResponseEntity<ApiResponse<RaidLogResponse>> getRaidLogs(
            @PathVariable("raidId") Integer raidId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        RaidLogResponse response = raidService.getRaidLogs(raidId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
