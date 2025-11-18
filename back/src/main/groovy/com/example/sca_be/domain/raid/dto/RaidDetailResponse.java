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
public class RaidDetailResponse {
    @JsonProperty("raid_id")
    private Integer raidId;

    @JsonProperty("class_id")
    private Integer classId;

    @JsonProperty("class_name")
    private String className;

    @JsonProperty("raid_name")
    private String raidName;

    private String template;

    private String difficulty;

    private String status;

    @JsonProperty("start_date")
    private LocalDateTime startDate;

    @JsonProperty("end_date")
    private LocalDateTime endDate;

    @JsonProperty("total_boss_hp")
    private Long totalBossHp;

    @JsonProperty("current_boss_hp")
    private Long currentBossHp;

    @JsonProperty("progress_percent")
    private Integer progressPercent;

    @JsonProperty("reward_coral")
    private Integer rewardCoral;

    @JsonProperty("special_reward_description")
    private String specialRewardDescription;

    @JsonProperty("participant_count")
    private Integer participantCount;

    @JsonProperty("remaining_seconds")
    private Long remainingSeconds;

    private List<ContributionInfo> contributions;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ContributionInfo {
        @JsonProperty("student_id")
        private Integer studentId;

        @JsonProperty("student_name")
        private String studentName;

        private Long damage;

        @JsonProperty("contribution_percent")
        private Double contributionPercent;
    }
}
