package com.example.sca_be.domain.groupquest.entity;

import com.example.sca_be.domain.auth.entity.Teacher;
import com.example.sca_be.domain.classroom.entity.Classes;
import com.example.sca_be.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "group_quests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupQuest extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_quest_id")
    private Integer groupQuestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private Classes classes;

    @Column(nullable = false, length = 255)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private GroupQuestStatus status;

    @Column(name = "reward_coral")
    private Integer rewardCoral;

    @Column(name = "reward_research_data")
    private Integer rewardResearchData;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Lob
    @Column(name = "content")
    private String content;


    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 20)
    private GroupQuestTemplate type;


    @OneToMany(mappedBy = "groupQuest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupQuestProgress> progressList = new ArrayList<>();


    @Builder
    public GroupQuest(Teacher teacher, Classes classes, String title, GroupQuestStatus status, Integer rewardCoral, Integer rewardResearchData, LocalDateTime endDate, String content, GroupQuestTemplate type) {
        this.teacher = teacher;
        this.classes = classes;
        this.title = title;
        this.status = status;
        this.rewardCoral = rewardCoral;
        this.rewardResearchData = rewardResearchData;
        this.endDate = endDate;
        this.content = content;
        this.type = type;
    }
}
