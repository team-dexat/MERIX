package gov.doca.merix.controller;

import gov.doca.merix.model.ApplicationStatus;
import gov.doca.merix.model.VerificationApplication;
import gov.doca.merix.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
@Tag(name = "Verification Applications Workflow", description = "Application filing, fee calculation, scrutiny, and tracking")
public class ApplicationController {

    private final ApplicationService applicationService;

    @GetMapping
    @Operation(summary = "List all applications or filter by user")
    public ResponseEntity<List<VerificationApplication>> getApplications(@RequestParam(required = false) String userId) {
        if (userId != null && !userId.isBlank()) {
            return ResponseEntity.ok(applicationService.getApplicationsByUserId(userId));
        }
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get application details by ID")
    public ResponseEntity<VerificationApplication> getApplicationById(@PathVariable String id) {
        return applicationService.getApplicationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Submit a new verification / re-verification application")
    public ResponseEntity<VerificationApplication> submitApplication(
            @RequestBody VerificationApplication application,
            @RequestParam(required = false, defaultValue = "USR-001") String userId,
            @RequestParam(required = false) String instrumentId
    ) {
        return ResponseEntity.ok(applicationService.submitApplication(application, userId, instrumentId));
    }

    @Data
    public static class StatusUpdateRequest {
        private ApplicationStatus status;
        private String remarks;
        private String officerId;
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update application status (Scrutiny pass, reject, allocate, etc.)")
    public ResponseEntity<VerificationApplication> updateStatus(
            @PathVariable String id,
            @RequestBody StatusUpdateRequest request
    ) {
        return ResponseEntity.ok(applicationService.updateStatus(id, request.getStatus(), request.getRemarks(), request.getOfficerId()));
    }
}
