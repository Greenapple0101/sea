package com.example.sca_be.domain.file.controller;

import com.example.sca_be.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadFile(
            @RequestParam("file") MultipartFile file) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("파일이 비어있습니다."));
        }

        try {
            // 업로드 디렉토리 생성
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 파일명 생성 (UUID + 원본 파일명)
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);

            // 파일 저장
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // URL 생성 (프론트엔드에서 접근 가능한 경로)
            String fileUrl = "/api/v1/files/" + filename;

            FileUploadResponse response = FileUploadResponse.builder()
                    .filename(filename)
                    .originalFilename(originalFilename)
                    .url(fileUrl)
                    .size(file.getSize())
                    .contentType(file.getContentType())
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(response, "파일이 업로드되었습니다."));

        } catch (IOException e) {
            log.error("파일 업로드 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("파일 업로드 중 오류가 발생했습니다."));
        }
    }

    @GetMapping("/{filename}")
    public ResponseEntity<byte[]> getFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename);
            
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            byte[] fileContent = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);
            
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(fileContent);

        } catch (IOException e) {
            log.error("파일 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

