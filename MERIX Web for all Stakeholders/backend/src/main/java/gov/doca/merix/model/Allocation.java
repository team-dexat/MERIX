package gov.doca.merix.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Allocation {

    @Id
    @Column(length = 64)
    private String id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "application_id", nullable = false)
    private VerificationApplication application;

    @Column(name = "assigned_to_type", nullable = false, length = 50)
    private String assignedToType; // LMO, GATC

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @Column(name = "assigned_to_name", nullable = false)
    private String assignedToName;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "scheduled_time_slot", nullable = false)
    private String scheduledTimeSlot; // e.g. 10:00 AM - 01:00 PM

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "allocated_by")
    private String allocatedBy;

    @Builder.Default
    @Column(length = 50)
    private String status = "SCHEDULED";

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
