package com.example.sca_be.domain.gacha.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class GachaInfoResponse {
    @JsonProperty("student_coral")
    private Integer studentCoral;

    @JsonProperty("gacha_cost")
    private Integer gachaCost;

    @JsonProperty("probability_table")
    private List<ProbabilityInfo> probabilityTable;

    @Getter
    @Builder
    public static class ProbabilityInfo {
        @JsonProperty("grade")
        private String grade;

        @JsonProperty("display_name")
        private String displayName;

        @JsonProperty("rate_percent")
        private Double ratePercent;
    }
}
