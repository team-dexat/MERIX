package gov.doca.merix.repository;

import gov.doca.merix.model.InspectionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InspectionRecordRepository extends JpaRepository<InspectionRecord, String> {
    Optional<InspectionRecord> findByApplicationId(String applicationId);
    List<InspectionRecord> findByOfficerId(String officerId);
}
