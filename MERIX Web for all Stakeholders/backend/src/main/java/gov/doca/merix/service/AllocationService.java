package gov.doca.merix.service;

import gov.doca.merix.model.Allocation;
import gov.doca.merix.model.ApplicationStatus;
import gov.doca.merix.model.User;
import gov.doca.merix.model.VerificationApplication;
import gov.doca.merix.repository.AllocationRepository;
import gov.doca.merix.repository.UserRepository;
import gov.doca.merix.repository.VerificationApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AllocationService {

    private final AllocationRepository allocationRepository;
    private final VerificationApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public List<Allocation> getAllAllocations() {
        return allocationRepository.findAll();
    }

    public List<Allocation> getAllocationsByOfficerId(String officerId) {
        return allocationRepository.findByAssignedToId(officerId);
    }

    public Optional<Allocation> getAllocationByApplicationId(String applicationId) {
        return allocationRepository.findByApplicationId(applicationId);
    }

    public Allocation allocateApplication(
            String applicationId,
            String assignedToType,
            String assignedToId,
            LocalDate scheduledDate,
            String scheduledTimeSlot,
            String instructions,
            String adminId
    ) {
        VerificationApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));

        User officer = userRepository.findById(assignedToId)
                .orElseThrow(() -> new RuntimeException("Officer/GATC user not found: " + assignedToId));

        Allocation allocation = Allocation.builder()
                .id("ALC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .application(app)
                .assignedToType(assignedToType)
                .assignedTo(officer)
                .assignedToName(officer.getFullName())
                .scheduledDate(scheduledDate)
                .scheduledTimeSlot(scheduledTimeSlot)
                .instructions(instructions)
                .allocatedBy(adminId)
                .status("SCHEDULED")
                .build();

        Allocation saved = allocationRepository.save(allocation);

        // Update Application Status
        app.setStatus(ApplicationStatus.SCHEDULED);
        applicationRepository.save(app);

        auditLogService.logAction(
                adminId != null ? adminId : "ADMIN",
                "Department Admin",
                "ADMIN",
                "ALLOCATE_APPLICATION",
                "ALLOCATION",
                saved.getId(),
                "Allocated application " + applicationId + " to " + officer.getFullName() + " on " + scheduledDate + " (" + scheduledTimeSlot + ")"
        );

        return saved;
    }
}
