package com.example.sca_be.domain.personalquest.entity;

import com.example.sca_be.domain.auth.entity.Teacher;
import com.example.sca_be.global.common.BaseTimeEntity;
import com.example.sca_be.domain.auth.entity.Member;
import com.example.sca_be.domain.personalquest.entity.QuestAssignment;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Quest extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quest_id")
    private Integer questId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @Column(nullable = false, length = 255)
    private String title;

    @Lob
    @Column(name = "teacher_content")
    private String teacherContent;

    @Column(name = "reward_coral_default")
    private Integer rewardCoralDefault;

    @Column(name = "reward_research_data_default")
    private Integer rewardResearchDataDefault;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(name = "difficulty")
    private Integer difficulty;

    // 이 퀘스트가 누구에게 할당되었는지 QuestAssignment를 통해 참조.
    @OneToMany(mappedBy = "quest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuestAssignment> questAssignments = new ArrayList<>();

    @Builder
    public Quest(Teacher teacher, String title, String teacherContent, Integer rewardCoralDefault, Integer rewardResearchDataDefault, LocalDateTime deadline, Integer difficulty) {
        this.teacher = teacher;
        this.title = title;
        this.teacherContent = teacherContent;
        this.rewardCoralDefault = rewardCoralDefault;
        this.rewardResearchDataDefault = rewardResearchDataDefault;
        this.deadline = deadline;
        this.difficulty = difficulty;
    }
}
