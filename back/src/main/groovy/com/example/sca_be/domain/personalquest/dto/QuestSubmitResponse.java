package com.example.sca_be.domain.personalquest.dto;

import com.example.sca_be.domain.personalquest.entity.QuestStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class QuestSubmitResponse {
    @JsonProperty("assignment_id")
    private Integer assignmentId;

    @JsonProperty("quest_id")
    private Integer questId;

    private QuestStatus status;
    private SubmissionInfo submission;

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
    }
}
