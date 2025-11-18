package com.example.sca_be.domain.auth.repository;

import com.example.sca_be.domain.auth.entity.Student;
import com.example.sca_be.domain.classroom.entity.Classes;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Integer> {
    List<Student> findByClassesOrderByMember_RealNameAsc(Classes classes);

    int countByClasses(Classes classes);
}
