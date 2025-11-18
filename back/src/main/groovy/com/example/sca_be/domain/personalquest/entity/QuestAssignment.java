package com.example.sca_be.domain.personalquest.entity;

import com.example.sca_be.domain.auth.entity.Student;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "quest_assignments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QuestAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Integer assignmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quest_id")
    private Quest quest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @Column(name = "reward_coral_personal")
    private Integer rewardCoralPersonal;

    @Column(name = "reward_research_data_personal")
    private Integer rewardResearchDataPersonal;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private QuestStatus status;

    //할당에 대한 결과물 참조
    @OneToOne(mappedBy = "questAssignment", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Submission submission;

    @Builder
    public QuestAssignment(Quest quest, Student student, Integer rewardCoralPersonal, Integer rewardResearchDataPersonal, QuestStatus status) {
        this.quest = quest;
        this.student = student;
        this.rewardCoralPersonal = rewardCoralPersonal;
        this.rewardResearchDataPersonal = rewardResearchDataPersonal;
        this.status = status;
    }

    public void updateStatus(QuestStatus status) {
        this.status = status;
    }
}
