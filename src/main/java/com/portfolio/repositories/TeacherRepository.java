package com.portfolio.repositories;

import com.portfolio.models.Role;
import com.portfolio.models.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT COUNT(t) FROM Teacher t WHERE t.role = ?1")
    long countByRole(Role role);
}