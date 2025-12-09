package com.portfolio.repositories;

import com.portfolio.models.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmail(String email);
    Optional<Student> findByIdName(String idName);
    boolean existsByEmail(String email);
    boolean existsByIdName(String idName);

    @Query("SELECT COUNT(s) FROM Student s WHERE s.group.id = ?1")
    long countByGroupId(Long groupId);
}