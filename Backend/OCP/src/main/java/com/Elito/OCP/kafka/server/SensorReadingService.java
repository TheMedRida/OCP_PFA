package com.Elito.OCP.kafka.server;

import com.Elito.OCP.kafka.entity.SensorReading;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface SensorReadingService {
    List<SensorReading> getLatestReadings(int limit);

    List<SensorReading> getReadingsByMachineId(String machineId, LocalDateTime start, LocalDateTime end, int limit);

    List<Map<String, Object>> getMachineHealthOverview();

    Map<String, Object> getVibrationAnalysis(String machineId, LocalDateTime start, LocalDateTime end);

    Map<String, Object> getTemperatureTrends(String machineId, LocalDateTime start, LocalDateTime end);

    Map<String, Object> getProductionMetrics(LocalDateTime start, LocalDateTime end);

    List<Map<String, Object>> getMaintenanceHistory(String machineId);

    Map<String, Object> getFailurePredictions();

    Map<String, Object> getEnvironmentalImpactAnalysis(String machineId, LocalDateTime start, LocalDateTime end);

    Map<String, Object> getElectricalMetrics(String machineId, LocalDateTime start, LocalDateTime end);

    Map<String, Object> getConnectivityStatus();

    List<Map<String, Object>> getAlerts(int limit);

    Map<String, Object> getMachineComparison(List<String> machineIds);

    Map<String, Object> getComponentHealthScores(String machineId);

    Map<String, Object> getStatisticalSummary(String machineId, LocalDateTime start, LocalDateTime end);
}
