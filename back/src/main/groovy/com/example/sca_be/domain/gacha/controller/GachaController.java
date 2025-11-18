package com.example.sca_be.domain.gacha.controller;

import com.example.sca_be.domain.gacha.dto.AquariumResponse;
import com.example.sca_be.domain.gacha.dto.EncyclopediaResponse;
import com.example.sca_be.domain.gacha.dto.GachaDrawResponse;
import com.example.sca_be.domain.gacha.dto.GachaInfoResponse;
import com.example.sca_be.domain.gacha.service.CollectionService;
import com.example.sca_be.domain.gacha.service.GachaService;
import com.example.sca_be.global.response.ApiResponse;
import com.example.sca_be.global.security.principal.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class GachaController {

    private final GachaService gachaService;
    private final CollectionService collectionService;

    /**
     * 1. 가챠 정보 조회
     * GET /api/gacha/info
     */
    @GetMapping("/gacha/info")
    public ResponseEntity<ApiResponse<GachaInfoResponse>> getGachaInfo(
            Authentication authentication) {

        Integer studentId = getStudentId(authentication);
        GachaInfoResponse response = gachaService.getGachaInfo(studentId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 2. 가챠 뽑기
     * POST /api/gacha/draw
     */
    @PostMapping("/gacha/draw")
    public ResponseEntity<ApiResponse<GachaDrawResponse>> drawGacha(
            Authentication authentication,
            @RequestBody com.example.sca_be.domain.gacha.dto.GachaDrawRequest request) {

        Integer studentId = getStudentId(authentication);
        GachaDrawResponse response = gachaService.drawGacha(studentId, request);

        return ResponseEntity.ok(ApiResponse.success(response, "가챠를 뽑았습니다!"));
    }

    /**
     * 3. 내 수족관 조회 (획득한 물고기 목록)
     * GET /api/collection/aquarium
     */
    @GetMapping("/collection/aquarium")
    public ResponseEntity<ApiResponse<AquariumResponse>> getAquarium(
            Authentication authentication) {

        Integer studentId = getStudentId(authentication);
        AquariumResponse response = collectionService.getAquarium(studentId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 4. 도감 조회 (전체 물고기 목록)
     * GET /api/collection/encyclopedia
     */
    @GetMapping("/collection/encyclopedia")
    public ResponseEntity<ApiResponse<EncyclopediaResponse>> getEncyclopedia(
            Authentication authentication) {

        Integer studentId = getStudentId(authentication);
        EncyclopediaResponse response = collectionService.getEncyclopedia(studentId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // Helper method
    private Integer getStudentId(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getMemberId();
    }
}
