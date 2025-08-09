package com.Elito.OCP.model;

import com.Elito.OCP.domain.InterventionStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Intervention {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    private InterventionStatus status = InterventionStatus.PENDING;



    @ManyToOne
    @JoinColumn(name = "created_by_id")
    @JsonIgnoreProperties({"interventionsCreated", "assignedInterventions"})
    private User createdBy; // USER who created

    @ManyToOne
    @JoinColumn(name = "technician_id")
    @JsonIgnoreProperties({"interventionsCreated", "assignedInterventions"})
    private User assignedTechnician; // TECHNICIAN

    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}


