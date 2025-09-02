package com.Elito.OCP.kafka.server;

import com.Elito.OCP.kafka.entity.SensorReading;
import com.Elito.OCP.kafka.repository.SensorReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SensorReadingServiceImpl implements SensorReadingService {

    private final SensorReadingRepository sensorReadingRepository;


    @Override
    public List<SensorReading> getLatestReadings(int limit) {
        // Use this if you choose Option 2:
        return sensorReadingRepository.findAllByOrderByTimestamprealDesc(PageRequest.of(0, limit));

        // Or if you want to keep the fixed limit method:
        // return sensorReadingRepository.findTop10ByOrderByTimestampDesc();
    }


    @Override
    public List<SensorReading> getReadingsByMachineId(String machineId, LocalDateTime start, LocalDateTime end, int limit) {
        if (start != null && end != null) {
            return sensorReadingRepository.findByMachineIdAndTimestamprealBetweenOrderByTimestamprealDesc(machineId, start, end);
        } else {
            return sensorReadingRepository.findByMachineIdOrderByTimestamprealDesc(machineId)
                    .stream()
                    .limit(limit)
                    .collect(Collectors.toList());
        }
    }

    @Override
    public List<SensorReading> getFailureReadings(int limit) {
        return sensorReadingRepository.findByMlPredictedFailureOrderByTimestamprealDesc(Boolean.TRUE, PageRequest.of(0, limit));
    }

    @Override
    public List<SensorReading> getFailureReadingsByTimeRange(LocalDateTime start, LocalDateTime end) {
        return sensorReadingRepository.findByMlPredictedFailureAndTimestampBetweenOrderByTimestampDesc(Boolean.TRUE, start, end);
    }

    @Override
    public List<String> getAvailableMachineIds() {
        return sensorReadingRepository.findDistinctMachineIds();
    }

    @Override
    public List<String> getAvailableMachineTypes() {
        return sensorReadingRepository.findDistinctMachineTypes();
    }

    @Override
    public List<Map<String, Object>> getMachineHealthOverview() {
        return sensorReadingRepository.findMachineHealthOverview(LocalDateTime.now().minusHours(24));
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
        if (start == null) start = LocalDateTime.now().minusDays(7);
        if (end == null) end = LocalDateTime.now();
        return sensorReadingRepository.findProductionMetrics(start, end);
    }

    @Override
    public List<Map<String, Object>> getMaintenanceHistory(String machineId) {
        return sensorReadingRepository.findMaintenanceHistory(machineId);
    }

    @Override
    public List<Map<String, Object>> getFailurePredictions() {
        return sensorReadingRepository.findFailurePredictions(LocalDateTime.now().minusHours(24));
    }

    @Override
    public Map<String, Object> getEnvironmentalImpactAnalysis(String machineId, LocalDateTime start, LocalDateTime end) {
        // Implement environmental analysis logic
        Map<String, Object> result = new HashMap<>();
        result.put("machineId", machineId);
        result.put("analysisPeriod", start + " to " + end);
        result.put("message", "Environmental impact analysis to be implemented");
        return result;
    }
    @Override
    public Map<String, Object> getElectricalMetrics(String machineId, LocalDateTime start, LocalDateTime end) {
        return sensorReadingRepository.findElectricalMetrics(machineId, start, end);
    }


    @Override
    public Map<String, Object> getConnectivityStatus() {
        // Implement connectivity status logic
        Map<String, Object> result = new HashMap<>();
        result.put("status", "connected");
        result.put("lastUpdate", LocalDateTime.now());
        result.put("message", "Connectivity status to be implemented");
        return result;
    }

    @Override
    public List<Map<String, Object>> getAlerts(int limit) {
        return sensorReadingRepository.findAlerts(LocalDateTime.now().minusHours(24), PageRequest.of(0, limit));
    }

    @Override
    public Map<String, Object> getMachineComparison(List<String> machineIds) {
        List<Map<String, Object>> comparisonData = sensorReadingRepository.findMachineComparison(
                machineIds, LocalDateTime.now().minusHours(24));

        Map<String, Object> result = new HashMap<>();
        for (Map<String, Object> data : comparisonData) {
            String machineId = (String) data.get("machineId");
            result.put(machineId, data);
        }
        return result;
    }

    @Override
    public Map<String, Object> getComponentHealthScores(String machineId) {
        // Implement component health scores logic
        Map<String, Object> result = new HashMap<>();
        result.put("machineId", machineId);
        result.put("healthScore", 85.5);
        result.put("status", "Good");
        result.put("message", "Component health scores to be implemented");
        return result;
    }

    @Override
    public Map<String, Object> getStatisticalSummary(String machineId, LocalDateTime start, LocalDateTime end) {
        return sensorReadingRepository.findStatisticalSummary(machineId, start, end);
    }

    @Override
    public List<Map<String, Object>> getTimeSeriesData(String machineId, LocalDateTime start, LocalDateTime end) {
        return sensorReadingRepository.findTimeSeriesData(machineId, start, end);
    }

    @Override
    public List<Map<String, Object>> getHighRiskMachines(int limit) {
        return sensorReadingRepository.findHighRiskMachines(LocalDateTime.now().minusHours(24), PageRequest.of(0, limit));
    }

    @Override
    public Map<String, Object> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();

        // Use the dedicated repository method instead of calling multiple methods
        Map<String, Object> stats = sensorReadingRepository.findDashboardSummary();

        // Get other data you need
        List<Map<String, Object>> highRiskMachines = getHighRiskMachines(5);
        List<Map<String, Object>> recentAlerts = getAlerts(10);
        Map<String, Object> productionMetrics = getProductionMetrics(
                LocalDateTime.now().minusHours(24), LocalDateTime.now());

        summary.put("overallStats", stats);
        summary.put("highRiskMachines", highRiskMachines);
        summary.put("recentAlerts", recentAlerts);
        summary.put("productionMetrics", productionMetrics);
        summary.put("lastUpdated", LocalDateTime.now());

        return summary;
    }

    @Override
    public Map<String, Object> getMLMetrics() {
        return sensorReadingRepository.findtMLModel();
    }

    @Override
    public List<Map<String, Object>> getFailureCountByMachine(LocalDateTime start, LocalDateTime end) {
        return sensorReadingRepository.findFailureCountByMachine(start, end);
    }
}


/*package com.Elito.OCP.kafka.server;


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
}*/