package com.example.sca_be.domain.raid.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Difficulty {
    LOW("하", 3000L),
    MEDIUM("중", 5000L),
    HIGH("상", 10000L);

    private final String displayName;
    private final long defaultHp;
}