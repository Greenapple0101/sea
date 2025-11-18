package com.example.sca_be.domain.gacha.repository;

import com.example.sca_be.domain.gacha.entity.Fish;
import com.example.sca_be.domain.gacha.entity.FishGrade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FishRepository extends JpaRepository<Fish, Integer> {
    // grade 컬럼에 인덱스가 걸려있어 효율적인 조회 가능
    List<Fish> findByGrade(FishGrade grade);
}
