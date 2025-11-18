package com.example.sca_be.domain.groupquest.entity;


import com.example.sca_be.domain.auth.entity.Student;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_quest_progress",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"group_quest_id", "student_id"}
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupQuestProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "progress_id")
    private Integer progressId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_quest_id")
    private GroupQuest groupQuest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @Column(name = "is_completed")
    private Boolean isCompleted;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Builder
    public GroupQuestProgress(GroupQuest groupQuest, Student student, Boolean isCompleted) {
        this.groupQuest = groupQuest;
        this.student = student;
        this.isCompleted = (isCompleted != null) ? isCompleted : false;
    }

    public void completeProgress() {
        this.isCompleted = true;
        this.completedAt = LocalDateTime.now();
    }
}
