package com.example.sca_be.domain.raid.entity;

public enum RaidStatus {
    ACTIVE,     // 진행중
    COMPLETED,  // 완료 (성공)
    EXPIRED,    // 만료 (실패)
    TERMINATED  // 중단 (관리자)
}
