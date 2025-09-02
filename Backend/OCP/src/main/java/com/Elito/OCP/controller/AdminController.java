package com.Elito.OCP.controller;

import com.Elito.OCP.domain.InterventionStatus;
import com.Elito.OCP.domain.USER_ROLE;
import com.Elito.OCP.model.Intervention;
import com.Elito.OCP.model.User;
import com.Elito.OCP.repository.InterventionRepository;
import com.Elito.OCP.repository.UserRepository;
import com.Elito.OCP.request.UserCreationRequest;
import com.Elito.OCP.request.UserUpdateRequest;
import com.Elito.OCP.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private InterventionRepository interventionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/create_user")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<User> createUser(@RequestBody UserCreationRequest request) {
        // Validate role - only allow USER or TECHNICIAN
        if (request.getRole() != USER_ROLE.USER && request.getRole() != USER_ROLE.TECHNICIAN) {
            throw new IllegalArgumentException("Only USER and TECHNICIAN roles can be created");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setRole(request.getRole());
        user.setTel(request.getTel());
        user.setPassword(passwordEncoder.encode("12345")); // Default password

        User savedUser = userRepository.save(user);

        // Send email
        emailService.sendWelcomeEmail(
                user.getEmail(),
                "Your account has been created",
                "Hi "+user.getFullName()+", you can access Nexus app as " + user.getRole() + " with default password: 12345"
        );

        return ResponseEntity.ok(savedUser);
    }

    // Dashboard Statistics
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.countByRole(USER_ROLE.USER));
        stats.put("totalTechnicians", userRepository.countByRole(USER_ROLE.TECHNICIAN));
        stats.put("totalInterventions", interventionRepository.count());
        stats.put("completedInterventions", interventionRepository.countByStatus(InterventionStatus.COMPLETED));
        stats.put("inprogressInterventions", interventionRepository.countByStatus(InterventionStatus.IN_PROGRESS));
        stats.put("pendingInterventions", interventionRepository.countByStatus(InterventionStatus.PENDING));
        return ResponseEntity.ok(stats);
    }

    // Recent Interventions
    @GetMapping("/interventions/recent")
    public ResponseEntity<List<Intervention>> getRecentInterventions() {
        List<Intervention> interventions = interventionRepository
                .findTop5ByOrderByIdDesc();
        return ResponseEntity.ok(interventions);
    }

    // Recent Users (only USER and TECHNICIAN)
    @GetMapping("/users/recent")
    public ResponseEntity<List<User>> getRecentUsers() {
        List<User> users = userRepository.findTop5ByRoleInOrderByIdDesc(List.of(USER_ROLE.USER, USER_ROLE.TECHNICIAN));
        return ResponseEntity.ok(users);
    }

    // All Users (only USER and TECHNICIAN)
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findByRoleIn(List.of(USER_ROLE.USER, USER_ROLE.TECHNICIAN));
        return ResponseEntity.ok(users);
    }

    // Technicians Only
    @GetMapping("/technicians")
    public ResponseEntity<List<User>> getAllTechnicians() {
        List<User> technicians = userRepository.findByRole(USER_ROLE.TECHNICIAN);
        return ResponseEntity.ok(technicians);
    }

    @GetMapping("/interventions")
    public ResponseEntity<List<Intervention>> getAllInterventions() {
        List<Intervention> interventions = interventionRepository.findAllByOrderByIdDesc();
        return ResponseEntity.ok(interventions);
    }

    // Assign technician to intervention (used in handleAssignTechnician)
    @PatchMapping("/interventions/{interventionId}/assign")
    public ResponseEntity<Intervention> assignTechnician(
            @PathVariable Long interventionId,
            @RequestParam Long technicianId) {

        Intervention intervention = interventionRepository.findById(interventionId)
                .orElseThrow(() -> new RuntimeException("Intervention not found"));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        if (technician.getRole() != USER_ROLE.TECHNICIAN) {
            throw new RuntimeException("User is not a technician");
        }

        intervention.setAssignedTechnician(technician);
        intervention.setStatus(InterventionStatus.IN_PROGRESS); // Update status

        Intervention updatedIntervention = interventionRepository.save(intervention);
        return ResponseEntity.ok(updatedIntervention);
    }


    @GetMapping("/interventions/status/{status}")
    public ResponseEntity<List<Intervention>> getInterventionsByStatus(
            @PathVariable InterventionStatus status) {
        List<Intervention> interventions = interventionRepository.findByStatus(status);
        return ResponseEntity.ok(interventions);
    }


    @PutMapping("/users/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<User> updateUser(
            @PathVariable Long userId,
            @RequestBody UserUpdateRequest updateRequest) {

        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate role - only allow USER or TECHNICIAN
        if (updateRequest.getRole() != USER_ROLE.USER && updateRequest.getRole() != USER_ROLE.TECHNICIAN) {
            throw new IllegalArgumentException("Only USER and TECHNICIAN roles can be assigned");
        }

        // Update fields
        existingUser.setFullName(updateRequest.getFullName());
        existingUser.setEmail(updateRequest.getEmail());
        existingUser.setTel(updateRequest.getTel());
        existingUser.setRole(updateRequest.getRole());

        // Only update password if a new one was provided
        if (updateRequest.getPassword() != null && !updateRequest.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
        }

        User updatedUser = userRepository.save(existingUser);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user has any interventions
            List<Intervention> createdInterventions = interventionRepository.findByCreatedBy(user);
            List<Intervention> assignedInterventions = interventionRepository.findByAssignedTechnician(user);

            if (!createdInterventions.isEmpty() || !assignedInterventions.isEmpty()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Cannot delete user with associated interventions"));
            }

            userRepository.delete(user);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }


    @DeleteMapping("/interventions/{interventionId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> deleteIntervention(@PathVariable Long interventionId) {
        try {
            Intervention intervention = interventionRepository.findById(interventionId)
                    .orElseThrow(() -> new RuntimeException("Intervention not found"));

            // Check if intervention is in progress and assigned to someone
            if (intervention.getStatus() == InterventionStatus.IN_PROGRESS &&
                    intervention.getAssignedTechnician() != null) {

                // Option 1: Prevent deletion (recommended)
                /*return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of(
                                "message", "Cannot delete intervention in progress",
                                "assignedTo", intervention.getAssignedTechnician().getEmail()
                        ));*/
                //Option 2 : Automatically unassign technician
                intervention.setAssignedTechnician(null);
                intervention.setStatus(InterventionStatus.PENDING);
                interventionRepository.save(intervention);

            }

            interventionRepository.delete(intervention);
            return ResponseEntity.ok(Map.of("message", "Intervention deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/interventions/{interventionId}/reassign")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> updateAssignment(
            @PathVariable Long interventionId,
            @RequestParam(required = false) Long technicianId) {  // Null = unassign

        Intervention intervention = interventionRepository.findById(interventionId)
                .orElseThrow(() -> new RuntimeException("Intervention not found"));

        // Unassignment case
        if (technicianId == null) {
            intervention.setAssignedTechnician(null);
            intervention.setStatus(InterventionStatus.PENDING);
        }
        // Assignment case
        else {
            User technician = userRepository.findById(technicianId)
                    .orElseThrow(() -> new RuntimeException("Technician not found"));

            if (technician.getRole() != USER_ROLE.TECHNICIAN) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Selected user is not a technician"));
            }

            intervention.setAssignedTechnician(technician);
            intervention.setStatus(InterventionStatus.IN_PROGRESS);
        }

        Intervention updated = interventionRepository.save(intervention);
        return ResponseEntity.ok(updated);
    }


}