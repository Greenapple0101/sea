package com.example.sca_be.domain.file.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FileUploadResponse {
    private String filename;
    private String originalFilename;
    private String url;
    private Long size;
    private String contentType;
}

