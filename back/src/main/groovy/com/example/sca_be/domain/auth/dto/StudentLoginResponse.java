package com.example.sca_be.domain.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class StudentLoginResponse {

    @JsonProperty("user_type")
    private String userType;

    @JsonProperty("student_id")
    private Integer studentId;

    private String username;

    @JsonProperty("real_name")
    private String realName;

    private String nickname;

    private String email;

    @JsonProperty("class_id")
    private Integer classId;

    @JsonProperty("class_name")
    private String className;

    private Integer coral;

    @JsonProperty("research_data")
    private Integer researchData;

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