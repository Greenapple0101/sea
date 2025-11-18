package com.example.sca_be.domain.raid.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class RaidLogMessage {
    @JsonProperty("raid_id")
    private Integer raidId;
    private String type;
    @JsonProperty("student_name")
    private String studentName;
    @JsonProperty("damage_amount")
    private Integer damageAmount;
    @JsonProperty("remaining_boss_hp")
    private Long remainingBossHp;
    private String message;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}

