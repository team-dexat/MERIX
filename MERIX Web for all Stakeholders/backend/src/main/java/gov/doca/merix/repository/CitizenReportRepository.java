package gov.doca.merix.repository;

import gov.doca.merix.model.CitizenReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CitizenReportRepository extends JpaRepository<CitizenReport, String> {
    List<CitizenReport> findByStatus(String status);
    List<CitizenReport> findByInstrumentId(String instrumentId);
    List<CitizenReport> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
}
