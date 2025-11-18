package com.example.sca_be.domain.personalquest.repository;

import com.example.sca_be.domain.personalquest.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Integer> {

    @Query("SELECT s FROM Submission s " +
           "JOIN FETCH s.questAssignment qa " +
           "JOIN FETCH qa.student st " +
           "WHERE st.classes.classId = :classId " +
           "AND s.submittedAt >= :startDate " +
           "AND s.submittedAt <= :endDate")
    List<Submission> findByClassAndDateRange(
            @Param("classId") Integer classId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}