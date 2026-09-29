package gov.doca.merix.controller;

import gov.doca.merix.model.Certificate;
import gov.doca.merix.service.CertificateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/certificates")
@RequiredArgsConstructor
@Tag(name = "Digital Certificates & QR Verification", description = "Tamper-evident verification certificates with hash chain integrity")
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping
    @Operation(summary = "List all issued certificates or filter by user")
    public ResponseEntity<List<Certificate>> getCertificates(@RequestParam(required = false) String userId) {
        if (userId != null && !userId.isBlank()) {
            return ResponseEntity.ok(certificateService.getCertificatesByUserId(userId));
        }
        return ResponseEntity.ok(certificateService.getAllCertificates());
    }

    @GetMapping("/verify/{certNumber}")
    @Operation(summary = "Public QR Verification: Validate certificate authenticity & chain hash")
    public ResponseEntity<Certificate> verifyCertificate(@PathVariable String certNumber) {
        return certificateService.getCertificateByNumber(certNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{certNumber}/revoke")
    @Operation(summary = "Revoke digital certificate with statutory reason and audit logging")
    public ResponseEntity<Certificate> revokeCertificate(
            @PathVariable String certNumber,
            @RequestParam String reason,
            @RequestParam(required = false) String actorId,
            @RequestParam(required = false) String actorName
    ) {
        return ResponseEntity.ok(certificateService.revokeCertificate(certNumber, reason, actorId, actorName));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get certificate by internal ID")
    public ResponseEntity<Certificate> getCertificateById(@PathVariable String id) {
        return certificateService.getCertificateById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
