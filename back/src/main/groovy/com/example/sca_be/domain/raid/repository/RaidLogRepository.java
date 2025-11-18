package com.example.sca_be.domain.raid.repository;

import com.example.sca_be.domain.raid.entity.RaidLog;
import com.example.sca_be.domain.raid.entity.RaidLogType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RaidLogRepository extends JpaRepository<RaidLog, Long> {
    Page<RaidLog> findByRaid_RaidIdOrderByCreatedAtDesc(Integer raidId, Pageable pageable);

    @Query("SELECT rl FROM RaidLog rl " +
           "JOIN FETCH rl.raid r " +
           "JOIN FETCH rl.student s " +
           "WHERE r.classes.classId = :classId " +
           "AND rl.logType = :logType " +
           "AND rl.createdAt >= :startDate " +
           "AND rl.createdAt <= :endDate")
    List<RaidLog> findByClassAndTypeAndDateRange(
            @Param("classId") Integer classId,
            @Param("logType") RaidLogType logType,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}

