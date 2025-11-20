package com.example.sca_be.domain.file.controller;

import com.example.sca_be.domain.file.dto.FileUploadResponse;
import com.example.sca_be.domain.file.service.FileUploadService;
import com.example.sca_be.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final FileUploadService fileUploadService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadFile(
            @RequestParam("file") MultipartFile file) {
        
        log.info("파일 업로드 요청 수신: 파일명={}, 크기={}, 타입={}", 
                file.getOriginalFilename(), file.getSize(), file.getContentType());
        
        if (file.isEmpty()) {
            log.warn("빈 파일 업로드 시도");
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("파일이 비어있습니다."));
        }

        try {
            FileUploadResponse response = fileUploadService.uploadFile(file);
            log.info("파일 업로드 성공: {}", response.getUrl());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(response, "파일이 업로드되었습니다."));

        } catch (IOException e) {
            log.error("파일 업로드 실패 (IOException): 파일명={}, 크기={}", 
                    file.getOriginalFilename(), file.getSize(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("파일 업로드 중 오류가 발생했습니다: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.error("파일 업로드 실패 (IllegalArgumentException): {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("파일 업로드 실패 (예상치 못한 오류)", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("파일 업로드 중 예상치 못한 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}

