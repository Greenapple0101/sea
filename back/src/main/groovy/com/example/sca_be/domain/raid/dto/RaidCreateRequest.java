package com.example.sca_be.domain.raid.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class RaidCreateRequest {
    @NotNull(message = "반 ID는 필수입니다.")
    @JsonProperty("class_id")
    private Integer classId;

    @NotNull(message = "보스 템플릿은 필수입니다.")
    private String template;

    @NotNull(message = "레이드 이름은 필수입니다.")
    @JsonProperty("raid_name")
    private String raidName;

    @NotNull(message = "난이도는 필수입니다.")
    private String difficulty;

    @NotNull(message = "시작 일시는 필수입니다.")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("start_date")
    private LocalDateTime startDate;

    @NotNull(message = "종료 일시는 필수입니다.")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("end_date")
    private LocalDateTime endDate;

    @NotNull(message = "보스 HP는 필수입니다.")
    @Min(value = 1, message = "보스 HP는 1 이상이어야 합니다.")
    @JsonProperty("boss_hp")
    private Long bossHp;

    @NotNull(message = "코랄 보상은 필수입니다.")
    @Min(value = 1, message = "코랄 보상은 1 이상이어야 합니다.")
    @JsonProperty("reward_coral")
    private Integer rewardCoral;

    @JsonProperty("special_reward_description")
    private String specialRewardDescription;
}
