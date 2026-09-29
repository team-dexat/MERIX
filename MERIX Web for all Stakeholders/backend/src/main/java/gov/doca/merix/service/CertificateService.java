package gov.doca.merix.service;

import gov.doca.merix.model.Certificate;
import gov.doca.merix.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final AuditLogService auditLogService;

    public List<Certificate> getAllCertificates() {
        return certificateRepository.findAll();
    }

    public List<Certificate> getCertificatesByUserId(String userId) {
        return certificateRepository.findByUserId(userId);
    }

    public Optional<Certificate> getCertificateByNumber(String certificateNumber) {
        return certificateRepository.findByCertificateNumber(certificateNumber);
    }

    public Optional<Certificate> getCertificateById(String id) {
        return certificateRepository.findById(id);
    }

    public Certificate revokeCertificate(String certNumber, String reason, String actorId, String actorName) {
        Certificate cert = certificateRepository.findByCertificateNumber(certNumber)
                .orElseThrow(() -> new RuntimeException("Certificate not found: " + certNumber));

        cert.setStatus("CANCELLED");
        Certificate updated = certificateRepository.save(cert);

        auditLogService.logAction(
                actorId != null ? actorId : "ADMIN",
                actorName != null ? actorName : "Department Admin",
                "ADMIN",
                "REVOKE_CERTIFICATE",
                "CERTIFICATE",
                certNumber,
                "Certificate " + certNumber + " revoked. Statutory Reason: " + reason
        );

        return updated;
    }
}
