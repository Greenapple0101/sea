package com.example.sca_be.domain.notification.repository;

import com.example.sca_be.domain.notification.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
}
