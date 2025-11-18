package com.example.sca_be.domain.gacha.dto;

import com.example.sca_be.domain.gacha.entity.FishGrade;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GachaDrawResponse {
    @JsonProperty("drawn_fish")
    private DrawnFishInfo drawnFish;

    @JsonProperty("coral_spent")
    private Integer coralSpent;

    @JsonProperty("remaining_coral")
    private Integer remainingCoral;

    @Getter
    @Builder
    public static class DrawnFishInfo {
        @JsonProperty("fish_id")
        private Integer fishId;

        @JsonProperty("fish_name")
        private String fishName;

        private FishGrade grade;

        @JsonProperty("is_new")
        private Boolean isNew;

        @JsonProperty("current_count")
        private Integer currentCount;
    }
}
