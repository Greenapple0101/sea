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
public class RaidLogResponse {

    private List<RaidLogItem> logs;

    @JsonProperty("total_count")
    private Long totalCount;

    private int page;

    private int size;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class RaidLogItem {
        @JsonProperty("log_id")
        private Long logId;
        @JsonProperty("student_name")
        private String studentName;
        private Integer damage;
        private LocalDateTime timestamp;
        @JsonProperty("time_ago")
        private String timeAgo;
    }
}

