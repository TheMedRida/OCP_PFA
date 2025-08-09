package com.Elito.OCP.repository;

import com.Elito.OCP.domain.InterventionStatus;
import com.Elito.OCP.model.Intervention;
import com.Elito.OCP.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterventionRepository extends JpaRepository <Intervention , Long> {
    List<Intervention> findByCreatedByOrderByIdDesc(User user);
    List<Intervention> findByAssignedTechnicianOrderByCreatedAtDesc(User technician);
    List<Intervention> findTop5ByOrderByIdDesc();
    Long countByStatus(InterventionStatus status);
    List<Intervention> findByStatus(InterventionStatus status);
    List<Intervention> findAllByOrderByIdDesc();
    List<Intervention> findByCreatedBy(User user);
    List<Intervention> findByAssignedTechnician(User user);
}
