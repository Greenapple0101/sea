package com.example.sca_be.domain.classroom.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class ClassListResponse {

    private String teacherName;
    private List<ClassSummary> classes;
    private Integer totalCount;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ClassSummary {
        @JsonProperty("class_id")
        private Integer classId;
        @JsonProperty("class_name")
        private String className;
        @JsonProperty("student_count")
        private Integer studentCount;
        @JsonProperty("waiting_quest_count")
        private Integer waitingQuestCount;  // 대기 중인 퀘스트 수
    }
}
