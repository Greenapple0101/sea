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
public class RaidCreationInfoResponse {
    @JsonProperty("class_info")
    private ClassInfo classInfo;

    private List<Template> templates;

    @JsonProperty("difficulty_options")
    private List<DifficultyOption> difficultyOptions;

    @JsonProperty("active_raid")
    private ActiveRaid activeRaid;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ClassInfo {
        @JsonProperty("class_id")
        private Integer classId;

        @JsonProperty("class_name")
        private String className;

        @JsonProperty("student_count")
        private Integer studentCount;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Template {
        private String code;
        @JsonProperty("display_name")
        private String displayName;
        private String description;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class DifficultyOption {
        private String code;
        @JsonProperty("display_name")
        private String displayName;
        private Long hp;
        @JsonProperty("min_hp")
        private Long minHp;
        @JsonProperty("max_hp")
        private Long maxHp;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ActiveRaid {
        @JsonProperty("raid_id")
        private Integer raidId;

        @JsonProperty("raid_name")
        private String raidName;

        private String status;

        @JsonProperty("current_hp")
        private Long currentHp;

        @JsonProperty("total_hp")
        private Long totalHp;

        @JsonProperty("end_date")
        private LocalDateTime endDate;
    }
}
