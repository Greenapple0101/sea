package com.example.sca_be.domain.notification.repository;

import com.example.sca_be.domain.notification.entity.ActionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ActionLogRepository extends JpaRepository<ActionLog, Long> {

    @Query("SELECT al FROM ActionLog al " +
           "JOIN FETCH al.student s " +
           "WHERE s.classes.classId = :classId " +
           "AND al.createdAt >= :startDate " +
           "AND al.createdAt <= :endDate " +
           "AND al.changeCoral > 0")
    List<ActionLog> findByClassAndDateRangeWithCoralReward(
            @Param("classId") Integer classId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}
