package com.example.sca_be.domain.personalquest.dto;

import com.example.sca_be.domain.personalquest.entity.QuestStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class QuestDetailResponse {
    @JsonProperty("assignment_id")
    private Integer assignmentId;

    private QuestInfo quest;
    private StudentInfo student;

    @JsonProperty("reward_coral_personal")
    private Integer rewardCoralPersonal;

    @JsonProperty("reward_research_data_personal")
    private Integer rewardResearchDataPersonal;

    private QuestStatus status;
    private SubmissionInfo submission;

    @Getter
    @Builder
    public static class QuestInfo {
        @JsonProperty("quest_id")
        private Integer questId;

        private String title;

        @JsonProperty("teacher_content")
        private String teacherContent;
    }

    @Getter
    @Builder
    public static class StudentInfo {
        @JsonProperty("student_id")
        private Integer studentId;

        @JsonProperty("student_name")
        private String studentName;

        @JsonProperty("class_name")
        private String className;
    }

    @Getter
    @Builder
    public static class SubmissionInfo {
        @JsonProperty("submission_id")
        private Integer submissionId;

        @JsonProperty("student_content")
        private String studentContent;

        @JsonProperty("attachment_url")
        private String attachmentUrl;

        @JsonProperty("submitted_at")
        private LocalDateTime submittedAt;

        private String comment;
    }
}
