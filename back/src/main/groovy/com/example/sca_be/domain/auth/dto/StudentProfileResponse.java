package com.example.sca_be.domain.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class StudentProfileResponse {
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

    @JsonProperty("total_earned_coral")
    private Integer totalEarnedCoral;

    @JsonProperty("total_earned_research_data")
    private Integer totalEarnedResearchData;
}

