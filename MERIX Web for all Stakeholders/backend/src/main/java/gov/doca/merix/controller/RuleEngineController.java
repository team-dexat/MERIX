package gov.doca.merix.controller;

import gov.doca.merix.model.RuleEngineConfig;
import gov.doca.merix.service.RuleEngineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/rules")
@RequiredArgsConstructor
@Tag(name = "Zero-Code Rule Engine", description = "Admin configurable fee schedules, checklists, validity durations, and SLA thresholds")
public class RuleEngineController {

    private final RuleEngineService ruleEngineService;

    @GetMapping
    @Operation(summary = "Get all configured rules for all instrument categories")
    public ResponseEntity<List<RuleEngineConfig>> getAllRules() {
        return ResponseEntity.ok(ruleEngineService.getAllRules());
    }

    @GetMapping("/calculate-fee")
    @Operation(summary = "Calculate dynamic fee based on instrument type and application type")
    public ResponseEntity<?> calculateFee(
            @RequestParam String instrumentType,
            @RequestParam(defaultValue = "INITIAL_VERIFICATION") String applicationType
    ) {
        BigDecimal fee = ruleEngineService.calculateFee(instrumentType, applicationType);
        Map<String, Object> res = new HashMap<>();
        res.put("instrumentType", instrumentType);
        res.put("applicationType", applicationType);
        res.put("calculatedFee", fee);
        return ResponseEntity.ok(res);
    }

    @PostMapping
    @Operation(summary = "Update or create a rule engine configuration")
    public ResponseEntity<RuleEngineConfig> updateRule(@RequestBody RuleEngineConfig config) {
        return ResponseEntity.ok(ruleEngineService.saveOrUpdateRule(config));
    }
}
