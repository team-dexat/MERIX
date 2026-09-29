package gov.doca.merix.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @Column(length = 64)
    private String id;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(name = "actor_id", nullable = false)
    private String actorId;

    @Column(name = "actor_name", nullable = false)
    private String actorName;

    @Column(name = "actor_role", nullable = false)
    private String actorRole;

    @Column(name = "action_type", nullable = false)
    private String actionType;

    @Column(name = "resource_type", nullable = false)
    private String resourceType;

    @Column(name = "resource_id", nullable = false)
    private String resourceId;

    @Builder.Default
    @Column(name = "ip_address")
    private String ipAddress = "127.0.0.1";

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "payload_hash")
    private String payloadHash;
}
