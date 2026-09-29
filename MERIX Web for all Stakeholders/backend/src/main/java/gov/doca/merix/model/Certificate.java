package gov.doca.merix.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @Column(length = 64)
    private String id; // CERT-001

    @Column(name = "certificate_number", nullable = false, unique = true, length = 100)
    private String certificateNumber; // DOCA-LM-2026-00892

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "application_id")
    private VerificationApplication application;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "instrument_id")
    private Instrument instrument;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "officer_id")
    private User officer;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "stamp_id", nullable = false)
    private String stampId;

    @Column(name = "qr_code_url", nullable = false, columnDefinition = "TEXT")
    private String qrCodeUrl;

    @Column(name = "digital_signature_hash", nullable = false, columnDefinition = "TEXT")
    private String digitalSignatureHash;

    @Column(name = "chain_hash_previous", columnDefinition = "TEXT")
    private String chainHashPrevious;

    @Column(name = "chain_hash_current", nullable = false, columnDefinition = "TEXT")
    private String chainHashCurrent;

    @Builder.Default
    @Column(length = 50)
    private String status = "VALID"; // VALID, EXPIRING_SOON, EXPIRED, CANCELLED

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
