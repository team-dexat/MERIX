package gov.doca.merix.service;

import gov.doca.merix.model.CitizenReport;
import gov.doca.merix.model.Instrument;
import gov.doca.merix.repository.CitizenReportRepository;
import gov.doca.merix.repository.InstrumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CitizenReportService {

    private final CitizenReportRepository citizenReportRepository;
    private final InstrumentRepository instrumentRepository;
    private final AuditLogService auditLogService;

    public List<CitizenReport> getAllReports() {
        return citizenReportRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<CitizenReport> getOpenReports() {
        return citizenReportRepository.findByStatus("OPEN");
    }

    public CitizenReport submitReport(CitizenReport report, String instrumentId) {
        report.setId("REP-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        report.setStatus("OPEN");

        if (instrumentId != null) {
            Optional<Instrument> instOpt = instrumentRepository.findById(instrumentId);
            instOpt.ifPresent(inst -> {
                report.setInstrument(inst);
                report.setBusinessName(inst.getBusinessName());
                // Citizen report reduces trust score and flags drift risk
                inst.setTrustScore(Math.max(10, inst.getTrustScore() - 25));
                inst.setIsAtDriftRisk(true);
                instrumentRepository.save(inst);
            });
        }

        CitizenReport saved = citizenReportRepository.save(report);

        auditLogService.logAction(
                "PUBLIC_CITIZEN",
                report.getReportedByName(),
                "CITIZEN",
                "SUBMIT_CITIZEN_REPORT",
                "CITIZEN_REPORT",
                saved.getId(),
                "Reported issue '" + report.getIssueCategory() + "' against " + report.getBusinessName()
        );

        return saved;
    }

    public CitizenReport updateReportStatus(String reportId, String status, String resolutionNotes, String officerId) {
        CitizenReport rep = citizenReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found: " + reportId));

        rep.setStatus(status);
        if (resolutionNotes != null) {
            rep.setResolutionNotes(resolutionNotes);
        }
        if (officerId != null) {
            rep.setOfficerAssigned(officerId);
        }

        return citizenReportRepository.save(rep);
    }
}
