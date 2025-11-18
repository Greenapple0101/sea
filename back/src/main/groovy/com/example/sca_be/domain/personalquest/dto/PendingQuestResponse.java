package com.example.sca_be.domain.personalquest.dto;

import com.example.sca_be.domain.personalquest.entity.QuestStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class PendingQuestResponse {
    private List<PendingAssignment> assignments;

    @JsonProperty("total_count")
    private Integer totalCount;

    @Getter
    @Builder
    public static class PendingAssignment {
        @JsonProperty("assignment_id")
        private Integer assignmentId;

        @JsonProperty("quest_id")
        private Integer questId;

        private String title;

        @JsonProperty("student_id")
        private Integer studentId;

        @JsonProperty("student_name")
        private String studentName;

        @JsonProperty("class_name")
        private String className;

        @JsonProperty("submitted_at")
        private LocalDateTime submittedAt;

        @JsonProperty("reward_coral_personal")
        private Integer rewardCoralPersonal;

        @JsonProperty("reward_research_data_personal")
        private Integer rewardResearchDataPersonal;

        private QuestStatus status;
    }
}
