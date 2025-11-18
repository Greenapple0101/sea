package com.example.sca_be.domain.raid.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class RaidAttackResponse {

    @JsonProperty("raid_id")
    private Integer raidId;

    @JsonProperty("attack_log_id")
    private Long attackLogId;

    @JsonProperty("research_data_used")
    private Integer researchDataUsed;

    @JsonProperty("damage_dealt")
    private Integer damageDealt;

    @JsonProperty("boss_hp")
    private BossHp bossHp;

    @JsonProperty("raid_completed")
    private Boolean raidCompleted;

    private Rewards rewards;

    @JsonProperty("my_stats")
    private MyStats myStats;

    @JsonProperty("attacked_at")
    private LocalDateTime attackedAt;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class BossHp {
        private Long before;
        private Long after;
        private Integer percentage;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Rewards {
        private Integer coral;
        @JsonProperty("research_data")
        private Integer researchData;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class MyStats {
        @JsonProperty("total_damage")
        private Integer totalDamage;
        @JsonProperty("remaining_research_data")
        private Integer remainingResearchData;
    }
}

