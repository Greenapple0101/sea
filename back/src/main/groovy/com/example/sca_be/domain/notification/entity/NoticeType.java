package com.example.sca_be.domain.notification.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum NoticeType {
    PERSONAL_QUEST_ASSIGNED,
    PERSONAL_QUEST_APPROVED,
    PERSONAL_QUEST_REJECTED,
    COMMUNITY_QUEST_ASSIGNED,
    COMMUNITY_QUEST_FINISHED,
    COMMUNITY_QUEST_REJECTED,
    RAID_STARTED,
    RAID_FINISHED;
}
