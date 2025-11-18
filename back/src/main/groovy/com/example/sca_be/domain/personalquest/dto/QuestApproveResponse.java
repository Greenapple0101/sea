package com.example.sca_be.domain.personalquest.dto;

import com.example.sca_be.domain.personalquest.entity.QuestStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class QuestApproveResponse {
    @JsonProperty("assignment_id")
    private Integer assignmentId;

    @JsonProperty("quest_id")
    private Integer questId;

    @JsonProperty("student_id")
    private Integer studentId;

    @JsonProperty("student_name")
    private String studentName;

    private QuestStatus status;

    @JsonProperty("rewards_granted")
    private RewardsGranted rewardsGranted;

    private String comment;

    @JsonProperty("approved_at")
    private LocalDateTime approvedAt;

    @Getter
    @Builder
    public static class RewardsGranted {
        private Integer coral;

        @JsonProperty("research_data")
        private Integer researchData;
    }
}
