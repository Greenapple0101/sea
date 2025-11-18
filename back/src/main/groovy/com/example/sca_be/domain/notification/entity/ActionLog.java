package com.example.sca_be.domain.notification.entity;

import com.example.sca_be.domain.auth.entity.Member;
import com.example.sca_be.domain.auth.entity.Student;
import com.example.sca_be.domain.groupquest.entity.GroupQuest;
import com.example.sca_be.domain.personalquest.entity.QuestAssignment;
import com.example.sca_be.domain.raid.entity.Raid;
import com.example.sca_be.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "action_logs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class ActionLog extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", length = 50)
    private ActionLogType actionLogType;

    @Column(name = "change_coral")
    private Integer changeCoral;

    @Column(name = "change_research")
    private Integer changeResearch;

    @Column(name = "reference_id")
    private Integer referenceId;

    @Column(name = "log_message", length = 255)
    private String logMessage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private QuestAssignment questAssignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_quest_id")
    private GroupQuest groupQuest;

    // [유지] Raid FK 필드
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raid_id")
    private Raid raid;

    @Builder
    public ActionLog(Student student, ActionLogType actionLogType, Integer changeCoral,
                     Integer changeResearch, String logMessage,
                     QuestAssignment questAssignment, GroupQuest groupQuest, Raid raid) {
        this.student = student;
        this.actionLogType = actionLogType;
        this.changeCoral = changeCoral;
        this.changeResearch = changeResearch;
        this.logMessage = logMessage;
        this.questAssignment = questAssignment;
        this.groupQuest = groupQuest;
        this.raid = raid;
    }
}
