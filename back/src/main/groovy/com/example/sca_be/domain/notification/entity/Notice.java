package com.example.sca_be.domain.notification.entity;
import com.example.sca_be.domain.auth.entity.Student;
import com.example.sca_be.domain.groupquest.entity.GroupQuest;
import com.example.sca_be.domain.personalquest.entity.Quest;
import com.example.sca_be.domain.personalquest.entity.QuestAssignment;
import com.example.sca_be.domain.raid.entity.Raid;
import com.example.sca_be.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notice")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notice extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_id")
    private Long noticeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "notice_type", length = 50)
    private NoticeType noticeType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private QuestAssignment questAssignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_quest_id")
    private GroupQuest groupQuest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raid_id")
    private Raid raid;

    @Column(length = 255)
    private String title;

    @Column(length = 255)
    private String content;

    @Builder
    public Notice(NoticeType noticeType, String title, String content,
                  QuestAssignment questAssignment, Student student, GroupQuest groupQuest, Raid raid) {
        this.noticeType = noticeType;
        this.title = title;
        this.content = content;
        this.student= student;
        this.questAssignment = questAssignment;
        this.groupQuest = groupQuest;
        this.raid = raid;
    }
}
