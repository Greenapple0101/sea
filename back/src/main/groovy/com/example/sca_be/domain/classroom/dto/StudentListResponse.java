package com.example.sca_be.domain.classroom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class StudentListResponse {

    private Integer classId;
    private String className;
    private Integer studentCount;
    private List<StudentInfo> students;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class StudentInfo {
        private Integer studentId;
        private String name;
        private Integer pendingQuests;  // 임시 하드코딩될 필드
        private Integer coral;
        private Integer researchData;
    }
}
