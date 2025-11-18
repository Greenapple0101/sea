package com.example.sca_be.domain.classroom.entity;

import com.example.sca_be.domain.auth.entity.Student;
import com.example.sca_be.domain.auth.entity.Teacher;
import com.example.sca_be.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "classes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Classes extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "class_id")
    private Integer classId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @Column(name = "class_name", nullable = false, length = 100)
    private String className;

    @Column(name = "invite_code", unique = true, nullable = false, length = 20)
    private String inviteCode;

    @Column(length = 20)
    private String grade;

    @Column(length = 20)
    private String subject;

    @Column(length = 100)
    private String description;

    @OneToMany(mappedBy = "classes")
    private List<Student> students = new ArrayList<>();

    @Builder
    public Classes(Teacher teacher, String className, String inviteCode, String grade, String subject, String description) {
        this.teacher = teacher;
        this.className = className;
        this.inviteCode = inviteCode;
        this.grade = grade;
        this.subject = subject;
        this.description = description;
    }
}
