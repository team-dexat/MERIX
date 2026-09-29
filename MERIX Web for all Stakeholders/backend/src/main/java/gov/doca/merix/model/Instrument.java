package gov.doca.merix.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "instruments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Instrument {

    @Id
    @Column(length = 64)
    private String id; // e.g. INS-000101

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Column(name = "instrument_type", nullable = false)
    private String instrumentType; // Platform / Bench Scale, Weighbridge, etc.

    @Column(nullable = false)
    private String category; // NAWI, AWI, Measuring Instrument

    @Column(nullable = false)
    private String manufacturer;

    @Column(name = "model_number", nullable = false)
    private String modelNumber;

    @Column(name = "serial_number", nullable = false, unique = true)
    private String serialNumber;

    @Column(name = "accuracy_class", nullable = false)
    private String accuracyClass; // Class I, Class II, Class III, Class IIII

    @Column(name = "max_capacity", nullable = false)
    private String maxCapacity; // 50,000 kg, 300 kg, etc.

    @Column(name = "min_capacity")
    private String minCapacity;

    @Builder.Default
    @Column(name = "verification_interval_months")
    private Integer verificationIntervalMonths = 12;

    @Column(name = "verification_scale_interval_e")
    private String verificationScaleIntervalE;

    @Column(name = "actual_scale_interval_d")
    private String actualScaleIntervalD;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "installation_address", nullable = false, columnDefinition = "TEXT")
    private String installationAddress;

    private String pincode;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    @Column(name = "qr_code_data", columnDefinition = "TEXT")
    private String qrCodeData;

    @Builder.Default
    @Column(name = "trust_score")
    private Integer trustScore = 100;

    @Builder.Default
    @Column(name = "is_at_drift_risk")
    private Boolean isAtDriftRisk = false;

    @Builder.Default
    @Column(length = 50)
    private String status = "REGISTERED"; // REGISTERED, VERIFIED, EXPIRED, UNDER_INSPECTION

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
