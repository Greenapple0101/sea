package com.example.sca_be.domain.auth.repository;


import com.example.sca_be.domain.auth.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherRepository extends JpaRepository<Teacher, Integer> {
}
