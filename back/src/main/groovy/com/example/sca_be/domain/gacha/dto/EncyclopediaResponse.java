package com.example.sca_be.domain.gacha.dto;

import com.example.sca_be.domain.gacha.entity.FishGrade;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class EncyclopediaResponse {
    @JsonProperty("total_fish")
    private Integer totalFish;

    @JsonProperty("collected_count")
    private Integer collectedCount;

    @JsonProperty("collection_rate")
    private Double collectionRate;

    @JsonProperty("fish_list")
    private List<FishInfo> fishList;

    @Getter
    @Builder
    public static class FishInfo {
        @JsonProperty("fish_id")
        private Integer fishId;

        @JsonProperty("fish_name")
        private String fishName;

        private FishGrade grade;

        @JsonProperty("is_collected")
        private Boolean isCollected;

        @JsonProperty("fish_count")
        private Integer fishCount;
    }
}
