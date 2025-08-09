package com.Elito.OCP.controller;

import com.Elito.OCP.domain.InterventionStatus;
import com.Elito.OCP.domain.USER_ROLE;
import com.Elito.OCP.model.Intervention;
import com.Elito.OCP.model.User;
import com.Elito.OCP.repository.InterventionRepository;
import com.Elito.OCP.repository.UserRepository;
import com.Elito.OCP.request.InterventionRequest;
import com.Elito.OCP.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/interventions")
public class InterventionController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InterventionRepository interventionRepo;

    // USER creates intervention
    @PostMapping
    public ResponseEntity<Intervention> createIntervention(
            @RequestHeader("Authorization") String jwt,
            @RequestBody InterventionRequest request) throws Exception {

        User creator = userService.findUserProfileByJwt(jwt);

        Intervention intervention = new Intervention();
        intervention.setTitle(request.getTitle());
        intervention.setDescription(request.getDescription());
        intervention.setCreatedBy(creator);
        intervention.setCreatedAt(LocalDateTime.now());

        return ResponseEntity.ok(interventionRepo.save(intervention));
    }

    // ADMIN assigns technician
    @PatchMapping("/{id}/assign")
    public ResponseEntity<Intervention> assignTechnician(
            @PathVariable Long id,
            @RequestParam Long technicianId) {

        Intervention intervention = interventionRepo.findById(id).orElseThrow();
        User technician = userRepository.findById(technicianId).orElseThrow();

        if(technician.getRole() != USER_ROLE.TECHNICIAN) {
            throw new IllegalArgumentException("User is not a technician");
        }

        intervention.setAssignedTechnician(technician);
        intervention.setStatus(InterventionStatus.IN_PROGRESS);

        return ResponseEntity.ok(interventionRepo.save(intervention));
    }

    // TECHNICIAN marks as complete
    @PatchMapping("/{id}/complete")
    public ResponseEntity<Intervention> completeIntervention(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long id) throws Exception {

        User technician = userService.findUserProfileByJwt(jwt);
        Intervention intervention = interventionRepo.findById(id).orElseThrow();

        if(!intervention.getAssignedTechnician().equals(technician)) {
            throw new SecurityException("Not authorized to complete this intervention");
        }

        intervention.setStatus(InterventionStatus.COMPLETED);
        intervention.setCompletedAt(LocalDateTime.now());

        return ResponseEntity.ok(interventionRepo.save(intervention));
    }



    // User's own interventions
    @GetMapping("/my")
    public ResponseEntity<List<Intervention>> getUserInterventions(
            @RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        List<Intervention> interventions = interventionRepo
                .findByCreatedByOrderByIdDesc(user);
        return ResponseEntity.ok(interventions);
    }

    // Technician's assigned interventions
    @GetMapping("/assigned")
    public ResponseEntity<List<Intervention>> getAssignedInterventions(
            @RequestHeader("Authorization") String jwt) throws Exception {
        User technician = userService.findUserProfileByJwt(jwt);
        List<Intervention> interventions = interventionRepo
                .findByAssignedTechnicianOrderByCreatedAtDesc(technician);
        return ResponseEntity.ok(interventions);


    }
}
