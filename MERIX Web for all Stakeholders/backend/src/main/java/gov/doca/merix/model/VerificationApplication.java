package gov.doca.merix.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationApplication {

    @Id
    @Column(length = 64)
    private String id; // e.g. Merix-2026-00102

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "instrument_id", nullable = false)
    private Instrument instrument;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "application_type", nullable = false, length = 50)
    private String applicationType; // INITIAL_VERIFICATION, PERIODIC_REVERIFICATION, REVERIFICATION_AFTER_REPAIR

    @Column(name = "preferred_date", nullable = false)
    private LocalDate preferredDate;

    @Column(name = "calculated_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal calculatedFee;

    @Builder.Default
    @Column(name = "fee_paid")
    private Boolean feePaid = true;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 50)
    private ApplicationStatus status = ApplicationStatus.SUBMITTED;

    @Column(name = "documents_url", columnDefinition = "TEXT")
    private String documentsUrl;

    @Column(name = "scrutiny_remarks", columnDefinition = "TEXT")
    private String scrutinyRemarks;

    @Column(name = "scrutiny_officer_id")
    private String scrutinyOfficerId;

    @Builder.Default
    @Column(name = "filed_on")
    private LocalDateTime filedOn = LocalDateTime.now();

    @Column(name = "sla_due_date")
    private LocalDateTime slaDueDate;

    @Builder.Default
    @Column(name = "sla_breached")
    private Boolean slaBreached = false;

    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
