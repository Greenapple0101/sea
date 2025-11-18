package com.example.sca_be.domain.personalquest.repository;


import com.example.sca_be.domain.personalquest.entity.Quest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestRepository extends JpaRepository<Quest, Integer> {
    // (메서드는 나중에 API 개발 시 추가)
}
