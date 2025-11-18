package com.example.sca_be.domain.personalquest.dto;

import com.example.sca_be.domain.personalquest.entity.QuestStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class QuestCreateResponse {
    @JsonProperty("quest_id")
    private Integer questId;

    private String title;

    @JsonProperty("teacher_content")
    private String teacherContent;

    private Integer difficulty;
    private LocalDateTime deadline;

    @JsonProperty("reward_coral_default")
    private Integer rewardCoralDefault;

    @JsonProperty("reward_research_data_default")
    private Integer rewardResearchDataDefault;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    private List<AssignmentInfo> assignments;

    @JsonProperty("total_assigned")
    private Integer totalAssigned;

    @Getter
    @Builder
    public static class AssignmentInfo {
        @JsonProperty("assignment_id")
        private Integer assignmentId;

        @JsonProperty("student_id")
        private Integer studentId;

        @JsonProperty("student_name")
        private String studentName;

        @JsonProperty("reward_coral_personal")
        private Integer rewardCoralPersonal;

        @JsonProperty("reward_research_data_personal")
        private Integer rewardResearchDataPersonal;

        private QuestStatus status;
    }
}
