package com.example.sca_be.domain.raid.entity;

import com.example.sca_be.domain.auth.entity.Student;
import com.example.sca_be.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "raid_logs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RaidLog extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "raid_log_id")
    private Long raidLogId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raid_id", nullable = false)
    private Raid raid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "log_type", length = 40, nullable = false)
    private RaidLogType logType;

    @Column(name = "damage_amount")
    private Integer damageAmount;

    @Column(name = "research_data_used")
    private Integer researchDataUsed;

    @Column(name = "remaining_boss_hp")
    private Long remainingBossHp;

    @Column(name = "message", length = 255)
    private String message;

    @Builder
    public RaidLog(Raid raid,
                   Student student,
                   RaidLogType logType,
                   Integer damageAmount,
                   Integer researchDataUsed,
                   Long remainingBossHp,
                   String message) {
        this.raid = raid;
        this.student = student;
        this.logType = logType;
        this.damageAmount = damageAmount;
        this.researchDataUsed = researchDataUsed;
        this.remainingBossHp = remainingBossHp;
        this.message = message;
    }
}

