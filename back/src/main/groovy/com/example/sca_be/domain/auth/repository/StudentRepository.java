package com.example.sca_be.domain.auth.repository;

import com.example.sca_be.domain.auth.entity.Student;
import com.example.sca_be.domain.classroom.entity.Classes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Integer> {
    List<Student> findByClassesOrderByMember_RealNameAsc(Classes classes);

    int countByClasses(Classes classes);
    
    @Query("SELECT s FROM Student s LEFT JOIN FETCH s.classes WHERE s.memberId = :memberId")
    Optional<Student> findByIdWithClasses(@Param("memberId") Integer memberId);
}
