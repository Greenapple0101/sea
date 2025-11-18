package com.example.sca_be.domain.personalquest.controller;

import com.example.sca_be.domain.personalquest.dto.*;
import com.example.sca_be.domain.personalquest.service.PersonalQuestService;
import com.example.sca_be.global.response.ApiResponse;
import com.example.sca_be.global.security.principal.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/quests/personal")
@RequiredArgsConstructor
public class PersonalQuestController {

    private final PersonalQuestService personalQuestService;

    /**
     * 1. 퀘스트 생성 및 할당 (선생님용)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<QuestCreateResponse>> createQuest(
            Authentication authentication,
            @RequestBody QuestCreateRequest request) {

        Integer teacherId = getTeacherId(authentication);
        QuestCreateResponse response = personalQuestService.createQuest(teacherId, request);

        String message = String.format("퀘스트가 생성되고 %d명의 학생에게 할당되었습니다.", response.getTotalAssigned());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, message));
    }

    /**
     * 2. AI 보상 추천 받기 (선생님용) - 하드코딩
     */
    @PostMapping("/ai-recommend")
    public ResponseEntity<ApiResponse<AIRecommendResponse>> recommendRewards(
            @RequestBody AIRecommendRequest request) {

        AIRecommendResponse response = personalQuestService.recommendRewards(request);

        return ResponseEntity.ok(ApiResponse.success(response, "AI 보상 추천이 완료되었습니다."));
    }

    /**
     * 3. 승인 대기 목록 조회 (선생님용)
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<PendingQuestResponse>> getPendingQuests(
            Authentication authentication,
            @RequestParam(value = "class_id",required = false) Integer classId) {

        Integer teacherId = getTeacherId(authentication);
        PendingQuestResponse response = personalQuestService.getPendingQuests(teacherId, classId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 4. 퀘스트 할당 상세 조회 (선생님용)
     */
    @GetMapping("/{assignmentId}/detail")
    public ResponseEntity<ApiResponse<QuestDetailResponse>> getAssignmentDetail(
            Authentication authentication,
            @PathVariable("assignmentId") Integer assignmentId) {

        Integer teacherId = getTeacherId(authentication);
        QuestDetailResponse response = personalQuestService.getAssignmentDetail(teacherId, assignmentId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 5. 퀘스트 승인 (선생님용)
     */
    @PostMapping("/{assignmentId}/approve")
    public ResponseEntity<ApiResponse<QuestApproveResponse>> approveQuest(
            Authentication authentication,
            @PathVariable("assignmentId") Integer assignmentId,
            @RequestBody QuestApproveRequest request) {

        Integer teacherId = getTeacherId(authentication);
        QuestApproveResponse response = personalQuestService.approveQuest(teacherId, assignmentId, request);

        return ResponseEntity.ok(ApiResponse.success(response, "퀘스트가 승인되었습니다."));
    }

    /**
     * 6. 퀘스트 반려 (선생님용)
     */
    @PostMapping("/{assignmentId}/reject")
    public ResponseEntity<ApiResponse<QuestRejectResponse>> rejectQuest(
            Authentication authentication,
            @PathVariable("assignmentId") Integer assignmentId,
            @RequestBody QuestRejectRequest request) {

        Integer teacherId = getTeacherId(authentication);
        QuestRejectResponse response = personalQuestService.rejectQuest(teacherId, assignmentId, request);

        return ResponseEntity.ok(ApiResponse.success(response, "퀘스트가 반려되었습니다."));
    }

    /**
     * 7. 내 퀘스트 목록 조회 (학생용)
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<MyQuestListResponse>> getMyQuests(
            Authentication authentication,
            @RequestParam(value = "status",required = false) String status) {

        Integer studentId = getStudentId(authentication);
        System.out.println("=== 퀘스트 조회 API 호출 ===");
        System.out.println("인증된 학생 ID: " + studentId);
        System.out.println("요청 파라미터 status: " + status);
        
        MyQuestListResponse response = personalQuestService.getMyQuests(studentId, status);
        
        System.out.println("응답 - 활성 퀘스트 수: " + (response.getActiveQuests() != null ? response.getActiveQuests().size() : 0));
        System.out.println("응답 - 승인 퀘스트 수: " + (response.getApprovedQuests() != null ? response.getApprovedQuests().size() : 0));
        System.out.println("========================");

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 8. 퀘스트 제출 (학생용)
     */
    @PostMapping("/{assignmentId}/submit")
    public ResponseEntity<ApiResponse<QuestSubmitResponse>> submitQuest(
            Authentication authentication,
            @PathVariable("assignmentId") Integer assignmentId,
            @RequestBody QuestSubmitRequest request) {

        Integer studentId = getStudentId(authentication);
        QuestSubmitResponse response = personalQuestService.submitQuest(studentId, assignmentId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "퀘스트가 제출되었습니다."));
    }

    /**
     * 9. 퀘스트 제출 수정 (학생용)
     */
    @PutMapping("/{assignmentId}/submit")
    public ResponseEntity<ApiResponse<QuestSubmitResponse>> updateSubmission(
            Authentication authentication,
            @PathVariable("assignmentId") Integer assignmentId,
            @RequestBody QuestSubmitRequest request) {

        Integer studentId = getStudentId(authentication);
        QuestSubmitResponse response = personalQuestService.updateSubmission(studentId, assignmentId, request);

        return ResponseEntity.ok(ApiResponse.success(response, "제출 내용이 수정되었습니다."));
    }

    /**
     * 10. 퀘스트 코멘트 조회 (학생용)
     */
    @GetMapping("/{assignmentId}/comment")
    public ResponseEntity<ApiResponse<QuestCommentResponse>> getQuestComment(
            Authentication authentication,
            @PathVariable("assignmentId") Integer assignmentId) {

        Integer studentId = getStudentId(authentication);
        QuestCommentResponse response = personalQuestService.getQuestComment(studentId, assignmentId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // Helper methods
    private Integer getTeacherId(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getMemberId();
    }

    private Integer getStudentId(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getMemberId();
    }
}
