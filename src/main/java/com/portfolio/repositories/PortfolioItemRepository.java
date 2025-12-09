package com.portfolio.repositories;

import com.portfolio.models.PortfolioItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PortfolioItemRepository extends JpaRepository<PortfolioItem, Long> {
    List<PortfolioItem> findByStudentId(Long studentId);
    List<PortfolioItem> findByStudentIdAndIsVerified(Long studentId, Boolean isVerified);
    List<PortfolioItem> findByIsVerified(Boolean isVerified);
    List<PortfolioItem> findByWorkTypeId(Long workTypeId);
}