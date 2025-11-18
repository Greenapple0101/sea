package com.example.sca_be.domain.personalquest.dto;

import com.example.sca_be.domain.personalquest.entity.QuestStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class QuestCommentResponse {
    @JsonProperty("assignment_id")
    private Integer assignmentId;

    private QuestInfo quest;
    private QuestStatus status;
    private SubmissionInfo submission;

    @JsonProperty("processed_at")
    private LocalDateTime processedAt;

    @Getter
    @Builder
    public static class QuestInfo {
        @JsonProperty("quest_id")
        private Integer questId;

        private String title;
    }

    @Getter
    @Builder
    public static class SubmissionInfo {
        @JsonProperty("submitted_at")
        private LocalDateTime submittedAt;

        private String comment;
    }
}
