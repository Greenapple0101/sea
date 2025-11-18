package com.example.sca_be.domain.notification.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ActionLogType {
    REWARD_RECEIVED,
    GROUP_QUEST_COMPLETE,
    RAID_REWARD_RECEIVED
}