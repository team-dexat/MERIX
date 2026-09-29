package gov.doca.merix.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "citizen_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CitizenReport {

    @Id
    @Column(length = 64)
    private String id; // REP-001

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "instrument_id")
    private Instrument instrument;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Builder.Default
    @Column(name = "reported_by_name")
    private String reportedByName = "Anonymous Citizen";

    @Column(name = "reported_by_phone")
    private String reportedByPhone;

    @Column(name = "issue_category", nullable = false)
    private String issueCategory; // SHORT_WEIGHT, BROKEN_SEAL, UNVERIFIED_DEVICE, EXPIRED_STAMP, ALTERED_MEASURE

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "photo_evidence_url", columnDefinition = "TEXT")
    private String photoEvidenceUrl;

    @Column(name = "reported_latitude")
    private Double reportedLatitude;

    @Column(name = "reported_longitude")
    private Double reportedLongitude;

    @Builder.Default
    @Column(length = 50)
    private String status = "OPEN"; // OPEN, UNDER_INVESTIGATION, ACTION_TAKEN, DISMISSED

    @Column(name = "officer_assigned")
    private String officerAssigned;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
