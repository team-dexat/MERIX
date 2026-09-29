package gov.doca.merix.repository;

import gov.doca.merix.model.RuleEngineConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RuleEngineConfigRepository extends JpaRepository<RuleEngineConfig, String> {
    Optional<RuleEngineConfig> findByInstrumentType(String instrumentType);
}
