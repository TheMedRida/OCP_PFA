package com.Elito.OCP.kafka.server;


import com.Elito.OCP.kafka.entity.SensorReading;
import com.Elito.OCP.kafka.repository.SensorReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.awt.print.Pageable;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SensorReadingServiceImpl implements SensorReadingService {

    private final SensorReadingRepository sensorReadingRepository;

    @Override
    public List<SensorReading> getLatestReadings(int limit) {
        return sensorReadingRepository.findTop10ByOrderByTimestampDesc();
    }

    @Override
    public List<SensorReading> getReadingsByMachineId(String machineId, LocalDateTime start, LocalDateTime end, int limit) {
        if (start != null && end != null) {
            return sensorReadingRepository.findByMachineIdAndTimestampBetweenOrderByTimestampDesc(machineId, start, end);
        } else {
            return sensorReadingRepository.findLatestByMachineId(machineId, (Pageable) PageRequest.of(0, limit));
        }
    }

    @Override
    public List<Map<String, Object>> getMachineHealthOverview() {
        return sensorReadingRepository.findMachineHealthOverview();
    }

    @Override
    public Map<String, Object> getVibrationAnalysis(String machineId, LocalDateTime start, LocalDateTime end) {
        return sensorReadingRepository.findVibrationAnalysis(machineId, start, end);
    }

    @Override
    public Map<String, Object> getTemperatureTrends(String machineId, LocalDateTime start, LocalDateTime end) {
        return sensorReadingRepository.findTemperatureTrends(machineId, start, end);
    }

    @Override
    public Map<String, Object> getProductionMetrics(LocalDateTime start, LocalDateTime end) {
        return sensorReadingRepository.findProductionMetrics(start, end);
    }

    @Override
    public List<Map<String, Object>> getMaintenanceHistory(String machineId) {
        return sensorReadingRepository.findMaintenanceHistory(machineId);
    }

    @Override
    public Map<String, Object> getFailurePredictions() {
        return sensorReadingRepository.findFailurePredictions();
    }

    @Override
    public Map<String, Object> getEnvironmentalImpactAnalysis(String machineId, LocalDateTime start, LocalDateTime end) {
        return sensorReadingRepository.findEnvironmentalImpactAnalysis(machineId, start, end);
    }

    @Override
    public Map<String, Object> getElectricalMetrics(String machineId, LocalDateTime start, LocalDateTime end) {
        return sensorReadingRepository.findElectricalMetrics(machineId, start, end);
    }

    @Override
    public Map<String, Object> getConnectivityStatus() {
        return sensorReadingRepository.findConnectivityStatus(LocalDateTime.now().minusHours(24));
    }

    @Override
    public List<Map<String, Object>> getAlerts(int limit) {
        return sensorReadingRepository.findAlerts((Pageable) PageRequest.of(0, limit));
    }

    @Override
    public Map<String, Object> getMachineComparison(List<String> machineIds) {
        List<Map<String, Object>> comparisonData = sensorReadingRepository.findMachineComparison(machineIds);
        // Convert list to map with machineId as key
        Map<String, Object> result = new HashMap<>();
        for (Map<String, Object> data : comparisonData) {
            String machineId = (String) data.get("machineId");
            result.put(machineId, data);
        }
        return result;
    }

    @Override
    public Map<String, Object> getComponentHealthScores(String machineId) {
        return sensorReadingRepository.findComponentHealthScores(machineId);
    }

    @Override
    public Map<String, Object> getStatisticalSummary(String machineId, LocalDateTime start, LocalDateTime end) {
        return sensorReadingRepository.findStatisticalSummary(machineId, start, end);
    }
}