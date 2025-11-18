package com.example.sca_be.domain.raid.repository;

import com.example.sca_be.domain.raid.entity.Raid;
import com.example.sca_be.domain.raid.entity.RaidStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RaidRepository extends JpaRepository<Raid, Integer> {
    Optional<Raid> findByClasses_ClassIdAndStatus(Integer classId, RaidStatus status);

    Optional<Raid> findByRaidIdAndStatus(Integer raidId, RaidStatus status);

    List<Raid> findByTeacher_MemberIdOrderByCreatedAtDesc(Integer teacherId);
}