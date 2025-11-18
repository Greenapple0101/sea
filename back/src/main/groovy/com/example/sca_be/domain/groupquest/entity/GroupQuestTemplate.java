package com.example.sca_be.domain.groupquest.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum GroupQuestTemplate {
    ATTENDANCE,
    ASSIGNMENT,
    PARTICIPATION,
    EXAM,
    OTHER;
}
