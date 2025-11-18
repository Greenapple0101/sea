package com.example.sca_be.domain.personalquest.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AIRecommendResponse {
    @JsonProperty("reward_coral_default")
    private Integer rewardCoralDefault;

    @JsonProperty("reward_research_data_default")
    private Integer rewardResearchDataDefault;

    private List<RecommendationInfo> recommendations;

    @Getter
    @Builder
    public static class RecommendationInfo {
        @JsonProperty("student_id")
        private Integer studentId;

        @JsonProperty("student_name")
        private String studentName;

        @JsonProperty("recommended_coral")
        private Integer recommendedCoral;

        @JsonProperty("recommended_research_data")
        private Integer recommendedResearchData;

        private String reason;
    }
}
