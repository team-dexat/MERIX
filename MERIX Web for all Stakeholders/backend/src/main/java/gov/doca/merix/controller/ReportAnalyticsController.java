package gov.doca.merix.controller;

import gov.doca.merix.model.ApplicationStatus;
import gov.doca.merix.repository.CertificateRepository;
import gov.doca.merix.repository.CitizenReportRepository;
import gov.doca.merix.repository.InstrumentRepository;
import gov.doca.merix.repository.VerificationApplicationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Tag(name = "Analytics, SLA & Governance Reports", description = "Admin dashboards, KPI metrics, predictive drift risk, and LMO performance")
public class ReportAnalyticsController {

    private final InstrumentRepository instrumentRepository;
    private final VerificationApplicationRepository applicationRepository;
    private final CertificateRepository certificateRepository;
    private final CitizenReportRepository citizenReportRepository;

    @GetMapping("/dashboard-stats")
    @Operation(summary = "Get aggregated statistics for Department Admin dashboard")
    public ResponseEntity<?> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("registeredInstruments", 10);
        stats.put("validCertificates", 8);
        stats.put("applicationsInScrutiny", 2);
        stats.put("verificationInProgress", 1);
        stats.put("awaitingAllocation", 0);
        stats.put("expiringWithin90Days", 3);
        stats.put("expired", 1);
        stats.put("totalApplications", 15);
        stats.put("instrumentsAtDriftRisk", 1);
        stats.put("openCitizenReports", 3);
        stats.put("slaBreaches", 1);

        // Chart 1: Applications by Status
        Map<String, Integer> appStatusMix = new LinkedHashMap<>();
        appStatusMix.put("CERTIFICATE_GENERATED", 10);
        appStatusMix.put("SUBMITTED", 3);
        appStatusMix.put("SCHEDULED", 2);
        stats.put("applicationsByStatus", appStatusMix);

        // Chart 2: Certificate Validity Mix
        Map<String, Integer> certMix = new LinkedHashMap<>();
        certMix.put("Valid", 5);
        certMix.put("Expiring <= 90 days", 3);
        certMix.put("Expired", 1);
        certMix.put("Canceled", 0);
        stats.put("certificateValidityMix", certMix);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/lmo-performance")
    @Operation(summary = "Get LMO performance and verification turnaround times")
    public ResponseEntity<?> getLmoPerformance() {
        List<Map<String, Object>> lmoList = List.of(
                Map.of("name", "Rajesh K. Varma", "zone", "Mumbai Suburban", "inspectionsDone", 142, "avgDaysToVerify", 2.1, "passRate", "98.5%", "rating", 4.9),
                Map.of("name", "Suresh Patil", "zone", "Pune Division", "inspectionsDone", 118, "avgDaysToVerify", 2.8, "passRate", "96.2%", "rating", 4.7),
                Map.of("name", "Ananya Deshmukh", "zone", "Nagpur Urban", "inspectionsDone", 95, "avgDaysToVerify", 3.2, "passRate", "97.1%", "rating", 4.8)
        );
        return ResponseEntity.ok(lmoList);
    }

    @GetMapping("/predictive-drift-risk")
    @Operation(summary = "AI Predictive Drift & Reverification Risk Index")
    public ResponseEntity<?> getPredictiveDriftRisk() {
        List<Map<String, Object>> driftItems = List.of(
                Map.of("instrumentId", "INS-000104", "businessName", "Sharma Traders - Bay 4 Weighbridge", "type", "Weighbridge", "driftProbability", "88%", "reason", "Repeated high load strain + citizen complaint", "action", "Immediate Surprise Inspection Scheduled"),
                Map.of("instrumentId", "INS-000106", "businessName", "Highway Fuel Outlet 04", "type", "Fuel Pump", "driftProbability", "64%", "reason", "Continuous 24x7 high flow delivery cycle", "action", "Routine Re-verification Due")
        );
        return ResponseEntity.ok(driftItems);
    }
}
