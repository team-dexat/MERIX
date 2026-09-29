package gov.doca.merix.repository;

import gov.doca.merix.model.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, String> {
    Optional<Certificate> findByCertificateNumber(String certificateNumber);
    List<Certificate> findByUserId(String userId);
    List<Certificate> findByStatus(String status);
    Optional<Certificate> findByInstrumentIdAndStatus(String instrumentId, String status);
    long countByStatus(String status);
}
