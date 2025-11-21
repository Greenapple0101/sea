package com.example.sca_be.domain.gacha.controller;

import com.example.sca_be.domain.gacha.dto.FishCreateRequest;
import com.example.sca_be.domain.gacha.dto.FishResponse;
import com.example.sca_be.domain.gacha.dto.FishUpdateRequest;
import com.example.sca_be.domain.gacha.service.FishService;
import com.example.sca_be.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fish")
@RequiredArgsConstructor
public class FishController {

    private final FishService fishService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FishResponse>>> getAllFish() {
        List<FishResponse> fishList = fishService.getAllFish();
        return ResponseEntity.ok(ApiResponse.success(fishList));
    }

    @GetMapping("/{fishId}")
    public ResponseEntity<ApiResponse<FishResponse>> getFishById(@PathVariable Integer fishId) {
        FishResponse fish = fishService.getFishById(fishId);
        return ResponseEntity.ok(ApiResponse.success(fish));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FishResponse>> createFish(@Valid @RequestBody FishCreateRequest request) {
        FishResponse fish = fishService.createFish(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(fish, "물고기가 생성되었습니다."));
    }

    @PutMapping("/{fishId}")
    public ResponseEntity<ApiResponse<FishResponse>> updateFish(
            @PathVariable Integer fishId,
            @Valid @RequestBody FishUpdateRequest request) {
        FishResponse fish = fishService.updateFish(fishId, request);
        return ResponseEntity.ok(ApiResponse.success(fish, "물고기가 수정되었습니다."));
    }

    @DeleteMapping("/{fishId}")
    public ResponseEntity<ApiResponse<Void>> deleteFish(@PathVariable Integer fishId) {
        fishService.deleteFish(fishId);
        return ResponseEntity.ok(ApiResponse.success(null, "물고기가 삭제되었습니다."));
    }
}

