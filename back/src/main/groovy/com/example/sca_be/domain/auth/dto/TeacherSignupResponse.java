package com.example.sca_be.domain.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class TeacherSignupResponse {

    @JsonProperty("teacher_id")
    private Integer teacherId;

    private String username;

    private String email;

    @JsonProperty("real_name")
    private String realName;

    private String nickname;

    private String role;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}