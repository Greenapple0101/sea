package com.example.sca_be.domain.raid.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RaidAttackRequest {

    @NotNull
    @Min(1)
    @JsonProperty("research_data_amount")
    private Integer researchDataAmount;

    @NotNull
    @Min(1)
    @JsonProperty("total_damage")
    private Integer totalDamage;
}

