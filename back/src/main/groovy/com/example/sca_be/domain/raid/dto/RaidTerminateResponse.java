package com.example.sca_be.domain.raid.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class RaidTerminateResponse {

    @JsonProperty("raid_id")
    private Integer raidId;

    private String status;

    private String message;
}
