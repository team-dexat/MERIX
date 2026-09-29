package gov.doca.merix.service;

import gov.doca.merix.model.*;
import gov.doca.merix.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InspectionService {

    private final InspectionRecordRepository inspectionRecordRepository;
    private final VerificationApplicationRepository applicationRepository;
    private final InstrumentRepository instrumentRepository;
    private final CertificateRepository certificateRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public Optional<InspectionRecord> getRecordByApplicationId(String applicationId) {
        return inspectionRecordRepository.findByApplicationId(applicationId);
    }

    public InspectionRecord submitInspectionAndGenerateCertificate(
            InspectionRecord record,
            String applicationId,
            String officerId
    ) {
        VerificationApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found: " + applicationId));

        Instrument instrument = app.getInstrument();
        User officer = userRepository.findById(officerId).orElse(null);

        record.setId("INSP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        record.setApplication(app);
        record.setInstrument(instrument);
        record.setOfficer(officer);
        record.setVerifiedAt(LocalDateTime.now());

        InspectionRecord savedRecord = inspectionRecordRepository.save(record);

        if ("PASSED".equalsIgnoreCase(record.getTestVerdict())) {
            // Generate Digital Verification Certificate
            long certCount = certificateRepository.count() + 893;
            String certNumber = "DOCA-LM-2026-" + String.format("%05d", certCount);

            // Compute SHA-256 Digital Signature and Chain Hash
            String signaturePayload = certNumber + "|" + instrument.getSerialNumber() + "|" + record.getStampNumber() + "|" + LocalDate.now();
            String signatureHash = computeSha256(signaturePayload);

            String prevHash = certificateRepository.findAll().stream()
                    .reduce((first, second) -> second)
                    .map(Certificate::getChainHashCurrent)
                    .orElse("GENESIS-CHAIN-HASH-000");

            String currentChainHash = computeSha256(prevHash + "|" + signatureHash);

            int validityMonths = instrument.getVerificationIntervalMonths() != null ? instrument.getVerificationIntervalMonths() : 12;
            LocalDate issueDate = LocalDate.now();
            LocalDate expiryDate = issueDate.plusMonths(validityMonths);

            Certificate certificate = Certificate.builder()
                    .id("CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .certificateNumber(certNumber)
                    .application(app)
                    .instrument(instrument)
                    .user(app.getUser())
                    .officer(officer)
                    .issueDate(issueDate)
                    .expiryDate(expiryDate)
                    .stampId(record.getStampNumber() != null ? record.getStampNumber() : "LM-STAMP-2026-" + (int)(1000 + Math.random()*9000))
                    .qrCodeUrl("https://merix.gov.in/verify/" + certNumber)
                    .digitalSignatureHash(signatureHash)
                    .chainHashPrevious(prevHash)
                    .chainHashCurrent(currentChainHash)
                    .status("VALID")
                    .build();

            certificateRepository.save(certificate);

            // Update application & instrument status
            app.setStatus(ApplicationStatus.CERTIFICATE_GENERATED);
            applicationRepository.save(app);

            instrument.setStatus("VERIFIED");
            instrument.setIsAtDriftRisk(false);
            instrument.setTrustScore(Math.min(100, instrument.getTrustScore() + 10));
            instrumentRepository.save(instrument);

            auditLogService.logAction(
                    officerId != null ? officerId : "LMO",
                    officer != null ? officer.getFullName() : "Legal Metrology Officer",
                    "LMO_OFFICER",
                    "GENERATE_CERTIFICATE",
                    "CERTIFICATE",
                    certificate.getCertificateNumber(),
                    "Generated Verification Certificate " + certNumber + " for " + instrument.getSerialNumber() + ". Stamp: " + certificate.getStampId()
            );
        } else {
            app.setStatus(ApplicationStatus.REJECTED);
            applicationRepository.save(app);

            instrument.setStatus("UNDER_INSPECTION");
            instrumentRepository.save(instrument);
        }

        return savedRecord;
    }

    private String computeSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }
}
