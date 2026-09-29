package gov.doca.merix.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rule_engine_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RuleEngineConfig {

    @Id
    @Column(length = 64)
    private String id; // RULE-01

    @Column(name = "instrument_type", nullable = false)
    private String instrumentType;

    @Column(name = "capacity_min_val")
    private BigDecimal capacityMinVal;

    @Column(name = "capacity_max_val")
    private BigDecimal capacityMaxVal;

    @Column(name = "capacity_unit")
    private String capacityUnit;

    @Column(name = "verification_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal verificationFee;

    @Column(name = "reverification_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal reverificationFee;

    @Builder.Default
    @Column(name = "validity_months")
    private Integer validityMonths = 12;

    @Column(name = "mpe_formula_class")
    private String mpeFormulaClass;

    @Column(name = "checklist_template", columnDefinition = "TEXT")
    private String checklistTemplateJson;

    @Builder.Default
    @Column(name = "sla_scrutiny_hours")
    private Integer slaScrutinyHours = 48;

    @Builder.Default
    @Column(name = "sla_verification_days")
    private Integer slaVerificationDays = 7;

    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
