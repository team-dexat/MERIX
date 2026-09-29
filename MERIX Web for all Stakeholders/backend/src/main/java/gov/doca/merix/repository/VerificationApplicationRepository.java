package gov.doca.merix.repository;

import gov.doca.merix.model.ApplicationStatus;
import gov.doca.merix.model.VerificationApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VerificationApplicationRepository extends JpaRepository<VerificationApplication, String> {
    List<VerificationApplication> findByUserIdOrderByFiledOnDesc(String userId);
    List<VerificationApplication> findByStatus(ApplicationStatus status);
    List<VerificationApplication> findAllByOrderByFiledOnDesc();
    long countByStatus(ApplicationStatus status);
}
