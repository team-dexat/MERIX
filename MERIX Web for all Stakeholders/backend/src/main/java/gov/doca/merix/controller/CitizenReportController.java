package gov.doca.merix.controller;

import gov.doca.merix.model.CitizenReport;
import gov.doca.merix.service.CitizenReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/citizen-reports")
@RequiredArgsConstructor
@Tag(name = "Citizen Reporting & Fraud Redressal", description = "Public complaints, drift alerts, and trust score management")
public class CitizenReportController {

    private final CitizenReportService citizenReportService;

    @GetMapping
    @Operation(summary = "Get all citizen reports (Admin view)")
    public ResponseEntity<List<CitizenReport>> getAllReports() {
        return ResponseEntity.ok(citizenReportService.getAllReports());
    }

    @PostMapping
    @Operation(summary = "Submit a public complaint / report issue on faulty instrument")
    public ResponseEntity<CitizenReport> submitReport(
            @RequestBody CitizenReport report,
            @RequestParam(required = false) String instrumentId
    ) {
        return ResponseEntity.ok(citizenReportService.submitReport(report, instrumentId));
    }

    @Data
    public static class ReportStatusUpdate {
        private String status;
        private String resolutionNotes;
        private String officerId;
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update citizen report resolution status")
    public ResponseEntity<CitizenReport> updateStatus(
            @PathVariable String id,
            @RequestBody ReportStatusUpdate req
    ) {
        return ResponseEntity.ok(citizenReportService.updateReportStatus(id, req.getStatus(), req.getResolutionNotes(), req.getOfficerId()));
    }
}
