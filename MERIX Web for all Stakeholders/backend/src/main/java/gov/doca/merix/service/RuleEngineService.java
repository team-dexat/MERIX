package gov.doca.merix.service;

import gov.doca.merix.model.RuleEngineConfig;
import gov.doca.merix.repository.RuleEngineConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RuleEngineService {

    private final RuleEngineConfigRepository ruleEngineConfigRepository;

    public List<RuleEngineConfig> getAllRules() {
        return ruleEngineConfigRepository.findAll();
    }

    public Optional<RuleEngineConfig> getRuleForInstrumentType(String instrumentType) {
        return ruleEngineConfigRepository.findByInstrumentType(instrumentType);
    }

    public BigDecimal calculateFee(String instrumentType, String applicationType) {
        Optional<RuleEngineConfig> configOpt = ruleEngineConfigRepository.findByInstrumentType(instrumentType);
        if (configOpt.isPresent()) {
            RuleEngineConfig config = configOpt.get();
            if ("INITIAL_VERIFICATION".equalsIgnoreCase(applicationType)) {
                return config.getVerificationFee();
            } else {
                return config.getReverificationFee();
            }
        }
        // Default fallback fee based on Legal Metrology general schedule
        return new BigDecimal("1000.00");
    }

    public RuleEngineConfig saveOrUpdateRule(RuleEngineConfig config) {
        return ruleEngineConfigRepository.save(config);
    }
}
