package gov.doca.merix.service;

import gov.doca.merix.model.AuditLog;
import gov.doca.merix.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    public AuditLog logAction(
            String actorId,
            String actorName,
            String actorRole,
            String actionType,
            String resourceType,
            String resourceId,
            String details
    ) {
        String payload = actorId + "|" + actionType + "|" + resourceId + "|" + LocalDateTime.now();
        String hash = computeSha256(payload);

        AuditLog log = AuditLog.builder()
                .id("AUD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .timestamp(LocalDateTime.now())
                .actorId(actorId)
                .actorName(actorName)
                .actorRole(actorRole)
                .actionType(actionType)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .details(details)
                .payloadHash(hash)
                .build();

        return auditLogRepository.save(log);
    }

    private String computeSha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(input.getBytes())).substring(0, 16);
        } catch (Exception e) {
            return UUID.randomUUID().toString().substring(0, 16);
        }
    }
}
