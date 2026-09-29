package gov.doca.merix.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inspection_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InspectionRecord {

    @Id
    @Column(length = 64)
    private String id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "application_id", nullable = false)
    private VerificationApplication application;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "instrument_id")
    private Instrument instrument;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "officer_id")
    private User officer;

    @Column(name = "inspector_latitude")
    private Double inspectorLatitude;

    @Column(name = "inspector_longitude")
    private Double inspectorLongitude;

    @Builder.Default
    @Column(name = "geo_fence_verified")
    private Boolean geoFenceVerified = true;

    @Column(name = "checklist_results", columnDefinition = "TEXT")
    private String checklistResultsJson;

    @Column(name = "test_load_readings", columnDefinition = "TEXT")
    private String testLoadReadingsJson;

    @Builder.Default
    @Column(name = "eccentricity_test_passed")
    private Boolean eccentricityTestPassed = true;

    @Builder.Default
    @Column(name = "repeatability_test_passed")
    private Boolean repeatabilityTestPassed = true;

    @Column(name = "calculated_max_error", precision = 10, scale = 4)
    private BigDecimal calculatedMaxError;

    @Column(name = "max_permissible_error", precision = 10, scale = 4)
    private BigDecimal maxPermissibleError;

    @Column(name = "test_verdict", nullable = false, length = 50)
    private String testVerdict; // PASSED, FAILED, CALIBRATION_REQUIRED

    @Column(name = "stamp_number")
    private String stampNumber; // LM-STAMP-2026-9821

    @Column(name = "security_seal_number")
    private String securitySealNumber;

    @Column(name = "inspection_photos", columnDefinition = "TEXT")
    private String inspectionPhotos;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Builder.Default
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt = LocalDateTime.now();
}
