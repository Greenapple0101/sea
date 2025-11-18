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

    @JsonProperty("template_display_name")
    private String templateDisplayName;

    private String status;

    @JsonProperty("total_boss_hp")
    private Long totalBossHp;

    @JsonProperty("current_boss_hp")
    private Long currentBossHp;

    @JsonProperty("remaining_seconds")
    private Long remainingSeconds;

    @JsonProperty("reward_coral")
    private Integer rewardCoral;

    @JsonProperty("special_reward_description")
    private String specialRewardDescription;

    @JsonProperty("my_total_contribution")
    private Integer myTotalContribution;

    @JsonProperty("remaining_research_data")
    private Integer remainingResearchData;
}
