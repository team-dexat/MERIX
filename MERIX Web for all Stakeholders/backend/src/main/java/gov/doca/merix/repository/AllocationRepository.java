package gov.doca.merix.repository;

import gov.doca.merix.model.Allocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AllocationRepository extends JpaRepository<Allocation, String> {
    List<Allocation> findByAssignedToId(String assignedToId);
    Optional<Allocation> findByApplicationId(String applicationId);
}
