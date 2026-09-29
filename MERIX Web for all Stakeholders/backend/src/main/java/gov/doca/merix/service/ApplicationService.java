package gov.doca.merix.service;

import gov.doca.merix.model.ApplicationStatus;
import gov.doca.merix.model.Instrument;
import gov.doca.merix.model.User;
import gov.doca.merix.model.VerificationApplication;
import gov.doca.merix.repository.InstrumentRepository;
import gov.doca.merix.repository.UserRepository;
import gov.doca.merix.repository.VerificationApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final VerificationApplicationRepository applicationRepository;
    private final InstrumentRepository instrumentRepository;
    private final UserRepository userRepository;
    private final RuleEngineService ruleEngineService;
    private final AuditLogService auditLogService;

    public List<VerificationApplication> getAllApplications() {
        return applicationRepository.findAllByOrderByFiledOnDesc();
    }

    public List<VerificationApplication> getApplicationsByUserId(String userId) {
        return applicationRepository.findByUserIdOrderByFiledOnDesc(userId);
    }

    public Optional<VerificationApplication> getApplicationById(String id) {
        return applicationRepository.findById(id);
    }

    public VerificationApplication submitApplication(VerificationApplication application, String userId, String instrumentId) {
        if (application.getId() == null || application.getId().isBlank()) {
            long count = applicationRepository.count() + 98;
            application.setId("Merix-2026-" + String.format("%05d", count));
        }

        if (userId != null) {
            Optional<User> userOpt = userRepository.findById(userId);
            userOpt.ifPresent(application::setUser);
        }

        if (instrumentId != null) {
            Optional<Instrument> instOpt = instrumentRepository.findById(instrumentId);
            instOpt.ifPresent(inst -> {
                application.setInstrument(inst);
                BigDecimal fee = ruleEngineService.calculateFee(inst.getInstrumentType(), application.getApplicationType());
                application.setCalculatedFee(fee);
            });
        }

        application.setStatus(ApplicationStatus.SUBMITTED);
        application.setFiledOn(LocalDateTime.now());
        application.setSlaDueDate(LocalDateTime.now().plusHours(48)); // 48-hour scrutiny SLA

        VerificationApplication saved = applicationRepository.save(application);

        auditLogService.logAction(
                userId != null ? userId : "SYSTEM",
                application.getUser() != null ? application.getUser().getFullName() : "Applicant",
                "BUSINESS_OWNER",
                "SUBMIT_APPLICATION",
                "APPLICATION",
                saved.getId(),
                "Submitted application for " + (application.getInstrument() != null ? application.getInstrument().getId() : "Instrument") + " with fee INR " + saved.getCalculatedFee()
        );

        return saved;
    }

    public VerificationApplication updateStatus(String applicationId, ApplicationStatus status, String remarks, String officerId) {
        VerificationApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));

        app.setStatus(status);
        if (remarks != null) {
            app.setScrutinyRemarks(remarks);
        }
        if (officerId != null) {
            app.setScrutinyOfficerId(officerId);
        }
        app.setUpdatedAt(LocalDateTime.now());

        VerificationApplication saved = applicationRepository.save(app);

        auditLogService.logAction(
                officerId != null ? officerId : "ADMIN",
                "Department Admin",
                "ADMIN",
                "UPDATE_STATUS_" + status.name(),
                "APPLICATION",
                applicationId,
                "Updated application status to " + status.name() + ". Remarks: " + remarks
        );

        return saved;
    }
}
