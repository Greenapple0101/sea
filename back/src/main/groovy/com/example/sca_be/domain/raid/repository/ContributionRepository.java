package com.example.sca_be.domain.raid.repository;

import com.example.sca_be.domain.auth.entity.Student;
import com.example.sca_be.domain.raid.entity.Contribution;
import com.example.sca_be.domain.raid.entity.Raid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ContributionRepository extends JpaRepository<Contribution, Integer> {

    Optional<Contribution> findByRaidAndStudent(Raid raid, Student student);

    List<Contribution> findByRaidOrderByDamageDesc(Raid raid);

    Page<Contribution> findByRaidOrderByDamageDesc(Raid raid, Pageable pageable);

    int countByRaid(Raid raid);

    // 클래스별 기여도 조회 (날짜 필터 제거됨)
    @Query("SELECT c FROM Contribution c " +
           "JOIN FETCH c.raid r " +
           "JOIN FETCH c.student s " +
           "WHERE r.classes.classId = :classId")
    List<Contribution> findByClassId(@Param("classId") Integer classId);
}

//테스트
//테스트 