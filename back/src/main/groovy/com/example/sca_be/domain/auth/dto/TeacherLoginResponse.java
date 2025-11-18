package com.example.sca_be.domain.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class TeacherLoginResponse {

    @JsonProperty("user_type")
    private String userType;

    @JsonProperty("teacher_id")
    private Integer teacherId;

    private String username;

    private String email;

    @JsonProperty("real_name")
    private String realName;

    private String nickname;

    private String role;

    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("refresh_token")
    private String refreshToken;

    @JsonProperty("token_type")
    private String tokenType;

    @JsonProperty("expires_in")
    private Long expiresIn;
}