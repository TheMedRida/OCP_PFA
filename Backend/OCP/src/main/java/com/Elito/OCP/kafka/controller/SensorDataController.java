package com.Elito.OCP.kafka.controller;

import com.Elito.OCP.kafka.entity.SensorReading;
import com.Elito.OCP.kafka.repository.SensorReadingRepository;
import com.Elito.OCP.kafka.server.SensorReadingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sensor-data")
@CrossOrigin(origins = "*")
public class SensorDataController {

    private final SensorReadingService sensorReadingService;

    public SensorDataController(SensorReadingService sensorReadingService) {
        this.sensorReadingService = sensorReadingService;
    }

    // 1. Get latest readings for dashboard
    @GetMapping("/latest")
    public ResponseEntity<List<SensorReading>> getLatestReadings(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(sensorReadingService.getLatestReadings(limit));
    }

    // 2. Get readings by machine ID
    @GetMapping("/machine/{machineId}")
    public ResponseEntity<List<SensorReading>> getReadingsByMachineId(
            @PathVariable String machineId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(defaultValue = "100") int limit) {
        return ResponseEntity.ok(sensorReadingService.getReadingsByMachineId(machineId, start, end, limit));
    }

    // 3. Get machine health overview
    @GetMapping("/health-overview")
    public ResponseEntity<List<Map<String, Object>>> getMachineHealthOverview() {
        return ResponseEntity.ok(sensorReadingService.getMachineHealthOverview());
    }

    // 4. Get vibration analysis data
    @GetMapping("/vibration-analysis/{machineId}")
    public ResponseEntity<Map<String, Object>> getVibrationAnalysis(
            @PathVariable String machineId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(sensorReadingService.getVibrationAnalysis(machineId, start, end));
    }

    // 5. Get temperature trends
    @GetMapping("/temperature-trends/{machineId}")
    public ResponseEntity<Map<String, Object>> getTemperatureTrends(
            @PathVariable String machineId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(sensorReadingService.getTemperatureTrends(machineId, start, end));
    }

    // 6. Get production metrics
    @GetMapping("/production-metrics")
    public ResponseEntity<Map<String, Object>> getProductionMetrics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(sensorReadingService.getProductionMetrics(start, end));
    }

    // 7. Get maintenance history
    @GetMapping("/maintenance-history")
    public ResponseEntity<List<Map<String, Object>>> getMaintenanceHistory(
            @RequestParam(required = false) String machineId) {
        return ResponseEntity.ok(sensorReadingService.getMaintenanceHistory(machineId));
    }

    // 8. Get failure predictions
    @GetMapping("/failure-predictions")
    public ResponseEntity<Map<String, Object>> getFailurePredictions() {
        return ResponseEntity.ok(sensorReadingService.getFailurePredictions());
    }

    // 9. Get environmental impact analysis
    @GetMapping("/environmental-impact")
    public ResponseEntity<Map<String, Object>> getEnvironmentalImpactAnalysis(
            @RequestParam String machineId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(sensorReadingService.getEnvironmentalImpactAnalysis(machineId, start, end));
    }

    // 10. Get electrical system metrics
    @GetMapping("/electrical-metrics/{machineId}")
    public ResponseEntity<Map<String, Object>> getElectricalMetrics(
            @PathVariable String machineId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(sensorReadingService.getElectricalMetrics(machineId, start, end));
    }

    // 11. Get network connectivity status
    @GetMapping("/connectivity-status")
    public ResponseEntity<Map<String, Object>> getConnectivityStatus() {
        return ResponseEntity.ok(sensorReadingService.getConnectivityStatus());
    }

    // 12. Get alerts and notifications
    @GetMapping("/alerts")
    public ResponseEntity<List<Map<String, Object>>> getAlerts(
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(sensorReadingService.getAlerts(limit));
    }

    // 13. Get machine comparison
    @GetMapping("/machine-comparison")
    public ResponseEntity<Map<String, Object>> getMachineComparison(
            @RequestParam List<String> machineIds) {
        return ResponseEntity.ok(sensorReadingService.getMachineComparison(machineIds));
    }

    // 14. Get component health scores
    @GetMapping("/component-health/{machineId}")
    public ResponseEntity<Map<String, Object>> getComponentHealthScores(
            @PathVariable String machineId) {
        return ResponseEntity.ok(sensorReadingService.getComponentHealthScores(machineId));
    }

    // 15. Get statistical summary
    @GetMapping("/statistical-summary")
    public ResponseEntity<Map<String, Object>> getStatisticalSummary(
            @RequestParam(required = false) String machineId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(sensorReadingService.getStatisticalSummary(machineId, start, end));
    }
}