package gov.doca.merix.controller;

import gov.doca.merix.model.Allocation;
import gov.doca.merix.service.AllocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/allocations")
@RequiredArgsConstructor
@Tag(name = "Field Inspection Allocation & Scheduling", description = "Admin allocation of inspections to LMOs and GATCs")
public class AllocationController {

    private final AllocationService allocationService;

    @GetMapping
    @Operation(summary = "Get all allocations or filter by assigned officer/GATC")
    public ResponseEntity<List<Allocation>> getAllocations(@RequestParam(required = false) String officerId) {
        if (officerId != null && !officerId.isBlank()) {
            return ResponseEntity.ok(allocationService.getAllocationsByOfficerId(officerId));
        }
        return ResponseEntity.ok(allocationService.getAllAllocations());
    }

    @GetMapping("/application/{appId}")
    @Operation(summary = "Get allocation details by Application ID")
    public ResponseEntity<Allocation> getAllocationByAppId(@PathVariable String appId) {
        return allocationService.getAllocationByApplicationId(appId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Data
    public static class AllocationRequest {
        private String applicationId;
        private String assignedToType; // LMO, GATC
        private String assignedToId;
        private LocalDate scheduledDate;
        private String scheduledTimeSlot;
        private String instructions;
        private String adminId;
    }

    @PostMapping
    @Operation(summary = "Allocate application to an LMO officer or GATC center")
    public ResponseEntity<Allocation> createAllocation(@RequestBody AllocationRequest req) {
        return ResponseEntity.ok(allocationService.allocateApplication(
                req.getApplicationId(),
                req.getAssignedToType(),
                req.getAssignedToId(),
                req.getScheduledDate(),
                req.getScheduledTimeSlot(),
                req.getInstructions(),
                req.getAdminId()
        ));
    }
}
