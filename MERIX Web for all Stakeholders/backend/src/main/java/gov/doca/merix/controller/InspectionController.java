package gov.doca.merix.controller;

import gov.doca.merix.model.InspectionRecord;
import gov.doca.merix.service.InspectionService;
import gov.doca.merix.service.MpeCalculatorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inspections")
@RequiredArgsConstructor
@Tag(name = "Field Inspection & Digital Testing Simulator", description = "Standard weight testing, MPE validation, and stamping")
public class InspectionController {

    private final InspectionService inspectionService;
    private final MpeCalculatorService mpeCalculatorService;

    @GetMapping("/application/{appId}")
    @Operation(summary = "Get inspection record by application ID")
    public ResponseEntity<InspectionRecord> getRecordByAppId(@PathVariable String appId) {
        return inspectionService.getRecordByApplicationId(appId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/submit")
    @Operation(summary = "Submit completed field inspection and generate tamper-evident QR certificate")
    public ResponseEntity<InspectionRecord> submitInspection(
            @RequestBody InspectionRecord record,
            @RequestParam String applicationId,
            @RequestParam(required = false, defaultValue = "USR-003") String officerId
    ) {
        return ResponseEntity.ok(inspectionService.submitInspectionAndGenerateCertificate(record, applicationId, officerId));
    }

    @Data
    public static class MpeSimRequest {
        private double appliedLoad;
        private double observedReading;
        private String accuracyClass;
        private double verificationScaleIntervalE;
        private boolean isInitialVerification;
    }

    @PostMapping("/simulate-reading")
    @Operation(summary = "Simulate standard weight test reading and evaluate MPE under Legal Metrology Rules")
    public ResponseEntity<?> simulateReading(@RequestBody MpeSimRequest req) {
        return ResponseEntity.ok(mpeCalculatorService.evaluateLoadReading(
                req.getAppliedLoad(),
                req.getObservedReading(),
                req.getAccuracyClass() != null ? req.getAccuracyClass() : "Class III",
                req.getVerificationScaleIntervalE() > 0 ? req.getVerificationScaleIntervalE() : 0.05,
                req.isInitialVerification()
        ));
    }
}
