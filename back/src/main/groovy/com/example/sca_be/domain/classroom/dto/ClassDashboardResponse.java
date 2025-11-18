package com.example.sca_be.domain.classroom.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class ClassDashboardResponse {

    @JsonProperty("class_name")
    private String className;

    @JsonProperty("weekly_summary")
    private WeeklySummary weeklySummary;

    @JsonProperty("quest_activity_trend")
    private List<QuestActivityTrend> questActivityTrend;

    @JsonProperty("top_submitters")
    private List<TopStudent> topSubmitters;

    @JsonProperty("raid_participants")
    private List<RaidParticipant> raidParticipants;

    @JsonProperty("hourly_submission_distribution")
    private List<HourlyDistribution> hourlySubmissionDistribution;

    @JsonProperty("coral_ranking")
    private List<CoralRanking> coralRanking;

    @JsonProperty("research_data_usage")
    private ResearchDataUsage researchDataUsage;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class WeeklySummary {
        private Integer submissions;
        @JsonProperty("approval_rate")
        private Double approvalRate;
        @JsonProperty("raid_attacks")
        private Integer raidAttacks;
        @JsonProperty("raid_participants")
        private Integer raidParticipants;
        @JsonProperty("total_coral_rewarded")
        private Integer totalCoralRewarded;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class QuestActivityTrend {
        private String date;
        private Integer submissions;
        private Integer approvals;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class TopStudent {
        @JsonProperty("student_id")
        private Integer studentId;
        @JsonProperty("student_name")
        private String studentName;
        @JsonProperty("submission_count")
        private Integer submissionCount;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class RaidParticipant {
        @JsonProperty("student_id")
        private Integer studentId;
        @JsonProperty("student_name")
        private String studentName;
        @JsonProperty("total_damage")
        private Integer totalDamage;
        @JsonProperty("attack_count")
        private Integer attackCount;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class HourlyDistribution {
        private Integer hour;
        private Integer count;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class CoralRanking {
        @JsonProperty("student_id")
        private Integer studentId;
        @JsonProperty("student_name")
        private String studentName;
        @JsonProperty("total_coral")
        private Integer totalCoral;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ResearchDataUsage {
        @JsonProperty("total_used")
        private Integer totalUsed;
        @JsonProperty("average_per_student")
        private Double averagePerStudent;
    }
}

