package com.example.sca_be.domain.gacha.dto;

import com.example.sca_be.domain.gacha.entity.FishGrade;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AquariumResponse {
    @JsonProperty("collection_id")
    private Integer collectionId;

    @JsonProperty("student_id")
    private Integer studentId;

    @JsonProperty("total_collected")
    private Integer totalCollected;

    @JsonProperty("collected_fish")
    private List<CollectedFishInfo> collectedFish;

    @Getter
    @Builder
    public static class CollectedFishInfo {
        @JsonProperty("entry_id")
        private Integer entryId;

        @JsonProperty("fish_id")
        private Integer fishId;

        @JsonProperty("fish_name")
        private String fishName;

        private FishGrade grade;

        @JsonProperty("fish_count")
        private Integer fishCount;
    }
}
