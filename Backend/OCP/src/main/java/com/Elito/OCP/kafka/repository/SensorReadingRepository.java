package com.Elito.OCP.kafka.repository;


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

}
