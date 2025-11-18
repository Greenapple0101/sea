package com.example.sca_be.domain.classroom.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class CreateClassResponse {

    @JsonProperty("class_id")
    private Integer classId;
    @JsonProperty("class_name")
    private String className;
    private String grade;
    private String subject;
    @JsonProperty("invite_code")
    private String inviteCode;
    @JsonProperty("teacher_id")
    private Integer teacherId;
    @JsonProperty("teacher_name")
    private String teacherName;
    @JsonProperty("student_count")
    private Integer studentCount;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
