package gov.doca.merix.repository;

import gov.doca.merix.model.Instrument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstrumentRepository extends JpaRepository<Instrument, String> {
    List<Instrument> findByUserId(String userId);
    List<Instrument> findByStatus(String status);
    Optional<Instrument> findBySerialNumber(String serialNumber);
}
