package com.Elito.OCP.kafka.repository;

import com.Elito.OCP.kafka.entity.SensorReading;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {


    List<SensorReading> findAllByOrderByTimestamprealDesc(Pageable pageable);

    // Basic queries
    boolean existsByTimestampreal(LocalDateTime timestamp);

    List<SensorReading> findByMachineIdOrderByTimestamprealDesc(String machineId);

    List<SensorReading> findByMachineIdAndTimestamprealBetweenOrderByTimestamprealDesc(
            String machineId, LocalDateTime start, LocalDateTime end);

    // Get latest readings with limit
    List<SensorReading> findTopNByOrderByTimestamprealDesc(Pageable pageable);

    // Get readings with failure occurrence
    List<SensorReading> findByMlPredictedFailureOrderByTimestamprealDesc(Boolean mlPredictedFailure, Pageable pageable);

    List<SensorReading> findByMlPredictedFailureAndTimestampBetweenOrderByTimestampDesc(
            Boolean mlPredictedFailure, LocalDateTime start, LocalDateTime end);

    // Machine-specific queries
    @Query("SELECT DISTINCT sr.machineId FROM SensorReading sr")
    List<String> findDistinctMachineIds();

    @Query("SELECT DISTINCT sr.machineType FROM SensorReading sr")
    List<String> findDistinctMachineTypes();

    // Dashboard overview queries
    @Query("SELECT new map(sr.machineId as machineId, " +
            "AVG(sr.componentHealthScore) as avgHealthScore, " +
            "AVG(sr.mlFailureProbability) as avgFailureProbability, " +
            "AVG(sr.rul) as avgRul, " +
            "COUNT(sr) as readingCount, " +
            "MAX(sr.timestampreal) as lastUpdate) " +
            "FROM SensorReading sr " +
            "WHERE sr.timestampreal >= :since " +
            "GROUP BY sr.machineId")
    List<Map<String, Object>> findMachineHealthOverview(@Param("since") LocalDateTime since);

    // Vibration analysis with advanced metrics
    @Query("SELECT new map(" +
            "AVG(sr.vibrationX) as avgVibrationX, " +
            "AVG(sr.vibrationY) as avgVibrationY, " +
            "AVG(sr.vibrationZ) as avgVibrationZ, " +
            "MAX(sr.peakVibration) as maxVibration, " +
            "MIN(sr.peakVibration) as minVibration, " +
            "STDDEV(sr.vibrationX) as stdDevX, " +
            "STDDEV(sr.vibrationY) as stdDevY, " +
            "STDDEV(sr.vibrationZ) as stdDevZ, " +
            "COUNT(sr) as readingCount) " +
            "FROM SensorReading sr " +
            "WHERE sr.machineId = :machineId AND sr.timestampreal BETWEEN :start AND :end")
    Map<String, Object> findVibrationAnalysis(@Param("machineId") String machineId,
                                              @Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end);

    // Temperature trends with thresholds
    @Query("SELECT new map(" +
            "AVG(sr.bearingTemperature) as avgBearingTemp, " +
            "AVG(sr.motorTemperature) as avgMotorTemp, " +
            "AVG(sr.gearboxTemperature) as avgGearboxTemp, " +
            "AVG(sr.oilTemperature) as avgOilTemp, " +
            "MAX(sr.motorTemperature) as maxMotorTemp, " +
            "MAX(sr.bearingTemperature) as maxBearingTemp, " +
            "MAX(sr.gearboxTemperature) as maxGearboxTemp, " +
            "MAX(sr.oilTemperature) as maxOilTemp, " +
            "MIN(sr.bearingTemperature) as minBearingTemp, " +
            "MIN(sr.motorTemperature) as minMotorTemp, " +
            "MIN(sr.gearboxTemperature) as minGearboxTemp, " +
            "MIN(sr.oilTemperature) as minOilTemp, " +
            "COUNT(sr) as readingCount, " +
            "SUM(CASE WHEN sr.motorTemperature > 100 THEN 1 ELSE 0 END) as overheatCount) " + // Fixed this line
            "FROM SensorReading sr " +
            "WHERE sr.machineId = :machineId AND sr.timestampreal BETWEEN :start AND :end")
    Map<String, Object> findTemperatureTrends(@Param("machineId") String machineId,
                                              @Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end);

    // Production metrics with efficiency
    @Query("SELECT new map(" +
            "AVG(sr.productionRate) as avgProductionRate, " +
            "SUM(sr.defectiveCount) as totalDefects, " +
            "AVG(sr.scrapRate) as avgScrapRate, " +
            "AVG(sr.utilizationPercentage) as avgUtilization, " +
            "AVG(sr.energyEfficiencyIndex) as avgEnergyEfficiency, " +
            "COUNT(DISTINCT sr.machineId) as activeMachines, " +
            "SUM(sr.cycleTime) as totalCycleTime) " +
            "FROM SensorReading sr " +
            "WHERE sr.timestampreal BETWEEN :start AND :end")
    Map<String, Object> findProductionMetrics(@Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end);

    // Maintenance history with details
    @Query("SELECT new map(" +
            "sr.timestampreal as timestamp, " +
            "sr.machineId as machineId, " +
            "sr.maintenanceType as type, " +
            "sr.maintenanceDuration as duration, " +
            "sr.maintenancePersonnelId as personnel, " +
            "sr.componentHealthScore as healthScoreAfter, " +
            "sr.replacedComponentsList as replacedComponents) " +
            "FROM SensorReading sr " +
            "WHERE sr.maintenanceType IS NOT NULL " +
            "AND (:machineId IS NULL OR sr.machineId = :machineId) " +
            "ORDER BY sr.timestampreal DESC")
    List<Map<String, Object>> findMaintenanceHistory(@Param("machineId") String machineId);

    // Failure predictions with risk levels
    @Query("SELECT new map(" +
            "sr.machineId as machineId, " +
            "AVG(sr.failureProbability) as avgFailureProbability, " +
            "MIN(sr.rul) as minRul, " +
            "MIN(sr.ttf) as minTtf, " +
            "MAX(sr.failureOccurrence) as hasFailed, " +
            "MAX(sr.timestampreal) as lastReading, " +
            "CASE " +
            "  WHEN AVG(sr.failureProbability) > 0.7 THEN 'HIGH_RISK' " +
            "  WHEN AVG(sr.failureProbability) > 0.4 THEN 'MEDIUM_RISK' " +
            "  ELSE 'LOW_RISK' " +
            "END as riskLevel) " +
            "FROM SensorReading sr " +
            "WHERE sr.timestampreal >= :since " +
            "GROUP BY sr.machineId")
    List<Map<String, Object>> findFailurePredictions(@Param("since") LocalDateTime since);

    // Real-time alerts and failures
    @Query("SELECT new map(" +
            "sr.timestampreal as timestamp, " +
            "sr.machineId as machineId, " +
            "sr.machineType as machineType, " +
            "sr.failureType as failureType, " +
            "sr.alertType as alertType, " +
            "sr.failureProbability as probability, " +
            "sr.failureOccurrence as failureOccurred, " +
            "sr.componentHealthScore as healthScore) " +
            "FROM SensorReading sr " +
            "WHERE (sr.failureProbability > 0.7 OR sr.alertType IS NOT NULL OR sr.failureOccurrence = 1) " +
            "AND sr.timestampreal >= :since " +
            "ORDER BY sr.timestampreal DESC")
    List<Map<String, Object>> findAlerts(@Param("since") LocalDateTime since, Pageable pageable);

    // Machine comparison with performance metrics
    @Query("SELECT new map(" +
            "sr.machineId as machineId, " +
            "AVG(sr.vibrationX) as avgVibration, " +
            "AVG(sr.motorTemperature) as avgTemperature, " +
            "AVG(sr.powerConsumption) as avgPower, " +
            "AVG(sr.productionRate) as avgProduction, " +
            "AVG(sr.failureProbability) as avgFailureProbability, " +
            "AVG(sr.componentHealthScore) as avgHealthScore, " +
            "AVG(sr.utilizationPercentage) as avgUtilization) " +
            "FROM SensorReading sr " +
            "WHERE sr.machineId IN :machineIds AND sr.timestampreal >= :since " +
            "GROUP BY sr.machineId")
    List<Map<String, Object>> findMachineComparison(@Param("machineIds") List<String> machineIds,
                                                    @Param("since") LocalDateTime since);

    // Statistical summary with advanced analytics
    @Query("SELECT new map(" +
            "COUNT(sr) as totalReadings, " +
            "MIN(sr.timestampreal) as earliestTimestamp, " +
            "MAX(sr.timestampreal) as latestTimestamp, " +
            "AVG(sr.failureProbability) as avgFailureProbability, " +
            "AVG(sr.componentHealthScore) as avgHealthScore, " +
            "COUNT(DISTINCT sr.machineId) as uniqueMachines, " +
            "SUM(sr.failureOccurrence) as totalFailures, " +
            "AVG(sr.productionRate) as avgProductionRate) " + // REMOVED PERCENTILE_CONT
            "FROM SensorReading sr " +
            "WHERE (:machineId IS NULL OR sr.machineId = :machineId) " +
            "AND (:start IS NULL OR sr.timestampreal >= :start) " +
            "AND (:end IS NULL OR sr.timestampreal <= :end)")
    Map<String, Object> findStatisticalSummary(@Param("machineId") String machineId,
                                               @Param("start") LocalDateTime start,
                                               @Param("end") LocalDateTime end);

    // Time series data for charts
    @Query("SELECT new map(" +
            "sr.timestampreal as timestamp, " +
            "sr.vibrationX as vibrationX, " +
            "sr.vibrationY as vibrationY, " +
            "sr.vibrationZ as vibrationZ, " +
            "sr.peakVibration as peakVibration, " +
            "sr.rmsVibration as rmsVibration, " +
            "sr.energyEfficiencyIndex as energyEfficiency, " +
            "sr.motorTemperature as motorTemperature, " +
            "sr.bearingTemperature as bearingTemperature, " +
            "sr.gearboxTemperature as gearboxTemperature, " +
            "sr.oilTemperature as oilTemperature, " +
            "sr.powerConsumption as powerConsumption, " +
            "sr.mlFailureProbability as failureProbability) " +
            "FROM SensorReading sr " +
            "WHERE sr.machineId = :machineId AND sr.timestampreal BETWEEN :start AND :end " +
            "ORDER BY sr.timestampreal")
    List<Map<String, Object>> findTimeSeriesData(@Param("machineId") String machineId,
                                                 @Param("start") LocalDateTime start,
                                                 @Param("end") LocalDateTime end);

    // Get machines with highest failure probability
    @Query("SELECT new map(" +
            "sr.machineId as machineId, " +
            "sr.timestampreal as timestamp, " +
            "sr.mlFailureProbability as failureProbability, " +
            "sr.rul as rul) " +
            "FROM SensorReading sr " +
            "WHERE sr.mlFailureProbability = (" +
            "   SELECT MAX(sr2.mlFailureProbability) " +
            "   FROM SensorReading sr2 " +
            "   WHERE sr2.machineId = sr.machineId " +
            "   AND sr2.timestampreal >= :since" +
            ") " +
            "AND sr.timestampreal >= :since " +
            "ORDER BY sr.mlFailureProbability DESC")
    List<Map<String, Object>> findHighRiskMachines(@Param("since") LocalDateTime since, Pageable pageable);


    @Query("SELECT new map(" +
            "COUNT(sr) as totalReadings, " +
            "MIN(sr.timestampreal) as earliestTimestamp, " +
            "MAX(sr.timestampreal) as latestTimestamp, " +
            "AVG(sr.mlFailureProbability) as avgFailureProbability, " +
            "AVG(sr.componentHealthScore) as avgHealthScore, " +
            "COUNT(DISTINCT sr.machineId) as uniqueMachines, " +
            "SUM(sr.mlPredictedFailure) as totalFailures, " +
            "AVG(sr.utilizationPercentage) as avgUtilization, " +
            "AVG(sr.productionRate) as avgProductionRate) " +
            "FROM SensorReading sr ")
    Map<String, Object> findDashboardSummary();


    // In SensorReadingRepository.java
    @Query("SELECT new map(" +
            "AVG(sr.voltagePhaseA) as avgVoltageA, " +
            "AVG(sr.voltagePhaseB) as avgVoltageB, " +
            "AVG(sr.voltagePhaseC) as avgVoltageC, " +
            "AVG(sr.currentPhaseA) as avgCurrentA, " +
            "AVG(sr.currentPhaseB) as avgCurrentB, " +
            "AVG(sr.currentPhaseC) as avgCurrentC, " +
            "AVG(sr.powerFactor) as avgPowerFactor, " +
            "AVG(sr.powerConsumption) as avgPowerConsumption, " +
            "AVG(sr.energyEfficiencyIndex) as avgEnergyEfficiency, " +
            "MAX(sr.voltagePhaseA) as maxVoltageA, " +
            "MAX(sr.voltagePhaseB) as maxVoltageB, " +
            "MAX(sr.voltagePhaseC) as maxVoltageC, " +
            "MAX(sr.currentPhaseA) as maxCurrentA, " +
            "MAX(sr.currentPhaseB) as maxCurrentB, " +
            "MAX(sr.currentPhaseC) as maxCurrentC, " +
            "MAX(sr.powerConsumption) as maxPowerConsumption, " +
            "MIN(sr.voltagePhaseA) as minVoltageA, " +
            "MIN(sr.voltagePhaseB) as minVoltageB, " +
            "MIN(sr.voltagePhaseC) as minVoltageC, " +
            "MIN(sr.powerFactor) as minPowerFactor, " +
            "MIN(sr.currentPhaseA) as minCurrentA, " +
            "MIN(sr.currentPhaseB) as minCurrentB, " +
            "MIN(sr.currentPhaseC) as minCurrentC, " +
            "COUNT(sr) as readingCount) " +
            "FROM SensorReading sr " +
            "WHERE sr.machineId = :machineId AND sr.timestampreal BETWEEN :start AND :end")
    Map<String, Object> findElectricalMetrics(@Param("machineId") String machineId,
                                              @Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end);

    @Query("SELECT new map(" +
            "sr.mlModelVersion as modelVersion, " +
            "sr.mlPredictionLatencyMs as predictionLatency, " +
            "sr.timestampreal as timestamp) " +
            "FROM SensorReading sr " +
            "ORDER BY sr.timestampreal DESC " +
            "LIMIT 1")
    Map<String, Object> findtMLModel();
    // In SensorReadingRepository.java
    // In SensorReadingRepository.java
    @Query("SELECT new map(sr.machineId as machineId, COUNT(sr) as failureCount) " +
            "FROM SensorReading sr " +
            "WHERE sr.mlPredictedFailure = True " +
            "AND sr.timestampreal BETWEEN :start AND :end " +
            "GROUP BY sr.machineId " +
            "ORDER BY COUNT(sr) DESC")
    List<Map<String, Object>> findFailureCountByMachine(@Param("start") LocalDateTime start,
                                                        @Param("end") LocalDateTime end);

}
/*package com.Elito.OCP.kafka.repository;


import com.Elito.OCP.kafka.entity.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.awt.print.Pageable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;


public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {
    boolean existsByTimestamp(LocalDateTime timestamp);

    List<SensorReading> findTop10ByOrderByTimestampDesc();

    List<SensorReading> findByMachineIdOrderByTimestampDesc(String machineId);

    List<SensorReading> findByMachineIdAndTimestampBetweenOrderByTimestampDesc(
            String machineId, LocalDateTime start, LocalDateTime end);

    // Custom queries using @Query annotation
    @Query("SELECT sr FROM SensorReading sr WHERE sr.machineId = :machineId ORDER BY sr.timestamp DESC")
    List<SensorReading> findLatestByMachineId(@Param("machineId") String machineId, Pageable pageable);

    @Query("SELECT new map(sr.machineId as machineId, AVG(sr.componentHealthScore) as avgHealthScore, " +
            "MAX(sr.failureProbability) as maxFailureProbability, MIN(sr.rul) as minRul) " +
            "FROM SensorReading sr GROUP BY sr.machineId")
    List<Map<String, Object>> findMachineHealthOverview();

    @Query("SELECT new map(AVG(sr.vibrationX) as avgVibrationX, AVG(sr.vibrationY) as avgVibrationY, " +
            "AVG(sr.vibrationZ) as avgVibrationZ, MAX(sr.peakVibration) as maxVibration, " +
            "MIN(sr.peakVibration) as minVibration, STDDEV(sr.vibrationX) as stdDevX) " +
            "FROM SensorReading sr WHERE sr.machineId = :machineId AND sr.timestamp BETWEEN :start AND :end")
    Map<String, Object> findVibrationAnalysis(@Param("machineId") String machineId,
                                              @Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end);

    @Query("SELECT new map(AVG(sr.bearingTemperature) as avgBearingTemp, AVG(sr.motorTemperature) as avgMotorTemp, " +
            "AVG(sr.gearboxTemperature) as avgGearboxTemp, MAX(sr.motorTemperature) as maxMotorTemp, " +
            "MIN(sr.oilTemperature) as minOilTemp) " +
            "FROM SensorReading sr WHERE sr.machineId = :machineId AND sr.timestamp BETWEEN :start AND :end")
    Map<String, Object> findTemperatureTrends(@Param("machineId") String machineId,
                                              @Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end);

    @Query("SELECT new map(AVG(sr.productionRate) as avgProductionRate, SUM(sr.defectiveCount) as totalDefects, " +
            "AVG(sr.scrapRate) as avgScrapRate, AVG(sr.utilizationPercentage) as avgUtilization) " +
            "FROM SensorReading sr WHERE sr.timestamp BETWEEN :start AND :end")
    Map<String, Object> findProductionMetrics(@Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end);

    @Query("SELECT new map(sr.timestamp as timestamp, sr.maintenanceType as type, " +
            "sr.maintenanceDuration as duration, sr.maintenancePersonnelId as personnel) " +
            "FROM SensorReading sr WHERE sr.maintenanceType IS NOT NULL " +
            "AND (:machineId IS NULL OR sr.machineId = :machineId) " +
            "ORDER BY sr.timestamp DESC")
    List<Map<String, Object>> findMaintenanceHistory(@Param("machineId") String machineId);

    @Query("SELECT new map(sr.machineId as machineId, AVG(sr.failureProbability) as avgFailureProbability, " +
            "MIN(sr.rul) as minRul, MIN(sr.ttf) as minTtf, MAX(sr.failureOccurrence) as hasFailed) " +
            "FROM SensorReading sr GROUP BY sr.machineId")
    Map<String, Object> findFailurePredictions();

    @Query("SELECT new map(CORR(sr.ambientTemperature, sr.motorTemperature) as tempCorrelation, " +
            "CORR(sr.ambientHumidity, sr.failureProbability) as humidityFailureCorrelation, " +
            "AVG(sr.dustConcentration) as avgDustConcentration) " +
            "FROM SensorReading sr WHERE sr.machineId = :machineId AND sr.timestamp BETWEEN :start AND :end")
    Map<String, Object> findEnvironmentalImpactAnalysis(@Param("machineId") String machineId,
                                                        @Param("start") LocalDateTime start,
                                                        @Param("end") LocalDateTime end);

    @Query("SELECT new map(AVG(sr.voltagePhaseA) as avgVoltageA, AVG(sr.currentPhaseA) as avgCurrentA, " +
            "AVG(sr.powerConsumption) as avgPowerConsumption, AVG(sr.energyEfficiencyIndex) as avgEfficiency, " +
            "MAX(sr.powerFactor) as maxPowerFactor) " +
            "FROM SensorReading sr WHERE sr.machineId = :machineId AND sr.timestamp BETWEEN :start AND :end")
    Map<String, Object> findElectricalMetrics(@Param("machineId") String machineId,
                                              @Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end);

    @Query("SELECT new map(AVG(sr.sensorPingRate) as avgPingRate, AVG(sr.dataPacketLossPercent) as avgPacketLoss, " +
            "AVG(sr.communicationLatency) as avgLatency, AVG(sr.networkBandwidthUsage) as avgBandwidthUsage) " +
            "FROM SensorReading sr WHERE sr.timestamp >= :startTime")
    Map<String, Object> findConnectivityStatus(@Param("startTime") LocalDateTime startTime);

    @Query("SELECT new map(sr.timestamp as timestamp, sr.machineId as machineId, " +
            "sr.failureType as failureType, sr.alertType as alertType, sr.failureProbability as probability) " +
            "FROM SensorReading sr WHERE sr.failureProbability > 0.7 OR sr.alertType IS NOT NULL " +
            "ORDER BY sr.timestamp DESC")
    List<Map<String, Object>> findAlerts(Pageable pageable);

    @Query("SELECT new map(sr.machineId as machineId, AVG(sr.vibrationX) as avgVibration, " +
            "AVG(sr.motorTemperature) as avgTemperature, AVG(sr.powerConsumption) as avgPower, " +
            "AVG(sr.productionRate) as avgProduction, AVG(sr.failureProbability) as avgFailureProbability) " +
            "FROM SensorReading sr WHERE sr.machineId IN :machineIds GROUP BY sr.machineId")
    List<Map<String, Object>> findMachineComparison(@Param("machineIds") List<String> machineIds);

    @Query("SELECT new map(AVG(sr.componentHealthScore) as avgHealthScore, " +
            "PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY sr.componentHealthScore) as medianHealthScore, " +
            "MIN(sr.componentHealthScore) as minHealthScore, MAX(sr.componentHealthScore) as maxHealthScore) " +
            "FROM SensorReading sr WHERE sr.machineId = :machineId")
    Map<String, Object> findComponentHealthScores(@Param("machineId") String machineId);

    @Query("SELECT new map(COUNT(sr) as totalReadings, MIN(sr.timestamp) as earliestTimestamp, " +
            "MAX(sr.timestamp) as latestTimestamp, AVG(sr.failureProbability) as avgFailureProbability, " +
            "AVG(sr.componentHealthScore) as avgHealthScore, COUNT(DISTINCT sr.machineId) as uniqueMachines) " +
            "FROM SensorReading sr " +
            "WHERE (:machineId IS NULL OR sr.machineId = :machineId) " +
            "AND (:start IS NULL OR sr.timestamp >= :start) " +
            "AND (:end IS NULL OR sr.timestamp <= :end)")
    Map<String, Object> findStatisticalSummary(@Param("machineId") String machineId,
                                               @Param("start") LocalDateTime start,
                                               @Param("end") LocalDateTime end);

}*/
