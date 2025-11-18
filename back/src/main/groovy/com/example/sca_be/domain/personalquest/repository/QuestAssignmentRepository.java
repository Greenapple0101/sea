package com.example.sca_be.domain.personalquest.repository;

import com.example.sca_be.domain.personalquest.entity.QuestAssignment;
import com.example.sca_be.domain.personalquest.entity.QuestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface QuestAssignmentRepository extends JpaRepository<QuestAssignment, Integer> {

    // 선생님이 생성한 퀘스트의 승인 대기 목록 조회
    @Query("SELECT qa FROM QuestAssignment qa " +
           "JOIN FETCH qa.quest q " +
           "JOIN FETCH qa.student s " +
           "JOIN FETCH s.member m " +
           "LEFT JOIN FETCH s.classes c " +
           "WHERE q.teacher.memberId = :teacherId " +
           "AND qa.status = :status")
    List<QuestAssignment> findPendingAssignmentsByTeacher(
        @Param("teacherId") Integer teacherId,
        @Param("status") QuestStatus status
    );

    // 선생님이 생성한 퀘스트의 승인 대기 목록 조회 (반 필터링)
    @Query("SELECT qa FROM QuestAssignment qa " +
           "JOIN FETCH qa.quest q " +
           "JOIN FETCH qa.student s " +
           "JOIN FETCH s.member m " +
           "LEFT JOIN FETCH s.classes c " +
           "WHERE q.teacher.memberId = :teacherId " +
           "AND qa.status = :status " +
           "AND s.classes.classId = :classId")
    List<QuestAssignment> findPendingAssignmentsByTeacherAndClass(
        @Param("teacherId") Integer teacherId,
        @Param("status") QuestStatus status,
        @Param("classId") Integer classId
    );

    // 학생의 퀘스트 목록 조회 (상태별)
    @Query("SELECT qa FROM QuestAssignment qa " +
           "JOIN FETCH qa.quest q " +
           "JOIN FETCH qa.student s " +
           "JOIN FETCH s.member m " +
           "LEFT JOIN FETCH qa.submission sub " +
           "WHERE s.memberId = :studentId " +
           "AND qa.status IN :statuses")
    List<QuestAssignment> findByStudentAndStatusIn(
        @Param("studentId") Integer studentId,
        @Param("statuses") List<QuestStatus> statuses
    );

    // 학생의 만료된 퀘스트 조회 (일주일 이내)
    @Query("SELECT qa FROM QuestAssignment qa " +
           "JOIN FETCH qa.quest q " +
           "JOIN FETCH qa.student s " +
           "WHERE s.memberId = :studentId " +
           "AND qa.status = :status " +
           "AND q.createdAt >= :oneWeekAgo")
    List<QuestAssignment> findExpiredQuestsWithinWeek(
        @Param("studentId") Integer studentId,
        @Param("status") QuestStatus status,
        @Param("oneWeekAgo") LocalDateTime oneWeekAgo
    );

    // 학생의 승인된 퀘스트 조회 (일주일 이내)
    @Query("SELECT qa FROM QuestAssignment qa " +
           "JOIN FETCH qa.quest q " +
           "JOIN FETCH qa.student s " +
           "LEFT JOIN FETCH qa.submission sub " +
           "WHERE s.memberId = :studentId " +
           "AND qa.status = :status " +
           "AND sub.submittedAt >= :oneWeekAgo")
    List<QuestAssignment> findApprovedQuestsWithinWeek(
        @Param("studentId") Integer studentId,
        @Param("status") QuestStatus status,
        @Param("oneWeekAgo") LocalDateTime oneWeekAgo
    );
}
