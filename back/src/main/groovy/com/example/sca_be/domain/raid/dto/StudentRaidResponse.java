package com.example.sca_be.domain.raid.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class StudentRaidResponse {

    @JsonProperty("raid_id")
    private Integer raidId;

    @JsonProperty("class_id")
    private Integer classId;

    @JsonProperty("class_name")
    private String className;

    @JsonProperty("raid_name")
    private String raidName;

    @JsonProperty("template")
    private String template;

    @JsonProperty("template_name")
    private String templateName;

    private String difficulty;

    private String status;

    @JsonProperty("boss_hp")
    private BossHp bossHp;

    @JsonProperty("end_date")
    private String endDate;

    @JsonProperty("remaining_time")
    private String remainingTime;

    @JsonProperty("reward_coral")
    private Integer rewardCoral;

    @JsonProperty("participants")
    private Integer participants;

    @JsonProperty("special_reward_description")
    private String specialRewardDescription;

    @JsonProperty("my_contribution")
    private MyContribution myContribution;

    @JsonProperty("my_research_data")
    private Integer myResearchData;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class BossHp {
        private Long total;
        private Long current;
        private Integer percentage;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class MyContribution {
        @JsonProperty("total_damage")
        private Integer totalDamage;

        @JsonProperty("last_attack_at")
        private String lastAttackAt;
    }
}
