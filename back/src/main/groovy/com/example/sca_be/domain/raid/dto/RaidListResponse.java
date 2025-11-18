package com.example.sca_be.domain.raid.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class RaidListResponse {

    private List<RaidSummary> raids;

    @JsonProperty("total_count")
    private Integer totalCount;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class RaidSummary {
        @JsonProperty("raid_id")
        private Integer raidId;
        @JsonProperty("class_id")
        private Integer classId;
        @JsonProperty("class_name")
        private String className;
        @JsonProperty("raid_name")
        private String raidName;
        private String status;
        private String difficulty;
        @JsonProperty("current_boss_hp")
        private Long currentBossHp;
        @JsonProperty("total_boss_hp")
        private Long totalBossHp;
        @JsonProperty("participant_count")
        private Integer participantCount;
        @JsonProperty("end_date")
        private LocalDateTime endDate;
    }
}

