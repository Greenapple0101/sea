package com.example.sca_be.domain.classroom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class ClassDetailResponse {

    private Integer classId;
    private String className;
    private String inviteCode;
    private List<OngoingGroupQuest> ongoingGroupQuests;
    private OngoingRaid ongoingRaid;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class OngoingGroupQuest {
        private Integer questId;
        private String title;
        private QuestProgress progress;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class QuestProgress {
        private Integer completed;
        private Integer required;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class OngoingRaid {
        private Integer raidId;
        private String title;
        private BossHp bossHp;
        private Integer participants;
        private String endDate;
        private String status;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class BossHp {
        private Long current;
        private Long total;
        private Integer percentage;
    }
}
