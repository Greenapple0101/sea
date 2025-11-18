package com.example.sca_be.domain.personalquest.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
public class QuestCreateRequest {
    private String title;

    @JsonProperty("teacher_content")
    private String teacherContent;

    private Integer difficulty;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime deadline;

    @JsonProperty("reward_coral_default")
    private Integer rewardCoralDefault;

    @JsonProperty("reward_research_data_default")
    private Integer rewardResearchDataDefault;

    @JsonProperty("ai_used")
    private Boolean aiUsed; // AI 사용 여부

    @JsonProperty("class_id")
    private Integer classId; // 선택적 필드 (현재는 사용하지 않지만 프론트엔드 호환성을 위해 추가)

    private List<AssignmentRequest> assignments;

    @Getter
    @NoArgsConstructor
    public static class AssignmentRequest {
        @JsonProperty("student_id")
        private Integer studentId;

        @JsonProperty("reward_coral_personal")
        private Integer rewardCoralPersonal;

        @JsonProperty("reward_research_data_personal")
        private Integer rewardResearchDataPersonal;

        // AI 관련 필드는 받기만 하고 무시
        @JsonProperty("ai_reward_coral")
        private Integer aiRewardCoral;

        @JsonProperty("ai_reward_research_data")
        private Integer aiRewardResearchData;
    }
}
