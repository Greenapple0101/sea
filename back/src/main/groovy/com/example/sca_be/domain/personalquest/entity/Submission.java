package com.example.sca_be.domain.personalquest.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "submission_id")
    private Integer submissionId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", unique = true)
    private QuestAssignment questAssignment;

    @Column(name = "attachment_url", length = 255)
    private String attachmentUrl;

    @CreatedDate
    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;

    @Lob
    @Column(name = "comment")
    private String comment;

    @Lob
    @Column(name = "student_content")
    private String studentContent;

    @Builder
    public Submission(QuestAssignment questAssignment, String attachmentUrl, String comment, String studentContent) {
        this.questAssignment = questAssignment;
        this.attachmentUrl = attachmentUrl;
        this.comment = comment;
        this.studentContent = studentContent;
    }

    public void updateContent(String studentContent, String attachmentUrl) {
        this.studentContent = studentContent;
        this.attachmentUrl = attachmentUrl;
    }

    public void updateComment(String comment) {
        this.comment = comment;
    }
}
