package com.Elito.OCP.kafka.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;


@Data
@Entity
@Table(name = "sensor_readings")
public class SensorReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Timestamp and Identification
    private LocalDateTime timestampreal;
    private LocalDateTime timestamp;
    private String machineId;
    private String machineType;
    private String productionLineId;
    private String operationalMode;
    private String jobCode;

    // Vibration Metrics
    private Double vibrationX;
    private Double vibrationY;
    private Double vibrationZ;
    private Double rmsVibration;
    private Double peakVibration;

    // Temperature Metrics
    private Double bearingTemperature;
    private Double motorTemperature;
    private Double gearboxTemperature;
    private Double oilTemperature;
    private Double coolantTemperature;

    // Oil and Fluid Metrics
    private Double oilViscosity;
    private Double oilParticleCount;
    private Double coolantFlowRate;

    // Acoustic and Signal Metrics
    private Double acousticEmissionLevel;
    private Double ultrasonicSignalStrength;
    private Double magneticFieldStrength;

    // Pressure and Flow Metrics
    private Double hydraulicPressure;
    private Double pneumaticPressure;
    private Double airFlowRate;
    private Double internalHumidity;

    // Electrical Metrics
    private Double voltagePhaseA;
    private Double voltagePhaseB;
    private Double voltagePhaseC;
    private Double currentPhaseA;
    private Double currentPhaseB;
    private Double currentPhaseC;
    private Double powerFactor;
    private Double powerConsumption;
    private Double energyEfficiencyIndex;

    // Mechanical Metrics
    private Double shaftSpeedRpm;
    private Double loadTorque;
    private Integer shaftAlignmentStatus;

    // Production Metrics
    private Double cycleTime;
    private Double productionRate;
    private Double scrapRate;
    private Double defectiveCount;
    private Double utilizationPercentage;

    // Machine Operation Metrics
    private Double toolChangeCount;
    private Double machineStartStopCycles;
    private Double timeSinceLastOperation;
    private Double toolWearLevel;
    private Double workloadPercentage;
    private Double idleTimeDuration;

    // Maintenance Metrics
    private String lastMaintenanceDate;
    private String maintenanceFrequency;
    private String maintenanceType;
    private Double maintenanceDuration;
    private String maintenancePersonnelId;

    // Failure Metrics
    private Integer failureOccurrence;
    private String failureTimestamp;
    private String failureType;
    private String faultCode;
    private String diagnosticCode;
    private Double numberOfPastFailures;
    private Double componentHealthScore;
    private Double downtimeDuration;
    private String replacedComponentsList;

    // Environmental Metrics
    private Double ambientTemperature;
    private Double ambientHumidity;
    private Double dustConcentration;
    private Double externalVibrationExposure;

    // Operational Context
    private String shiftCode;
    private String operatorId;
    private String machineLocationZone;
    private Double nearbyMachineLoad;
    private Double lightingCondition;
    private Double ventilationLevel;
    private Double soundPressureLevel;

    // Alert and Event Metrics
    private Double timeSinceLastAlert;
    private String alertType;
    private Double alarmCount24hr;
    private String lastResetTimestamp;
    private Integer eventSequenceNumber;
    private String errorCodeHistory;

    // Connectivity Metrics
    private Double sensorPingRate;
    private Double dataPacketLossPercent;
    private Double communicationLatency;
    private Double networkBandwidthUsage;
    private Double deviceBatteryLevel;
    private Double edgeProcessingTime;

    // Predictive Maintenance Metrics
    private Double rul; // Remaining Useful Life
    private Double ttf; // Time To Failure
    private Double failureProbability;
    private String maintenanceTypeLabel;
    private String failureComponentClass;



    // NEW ML PREDICTION COLUMNS
    private Double mlFailureProbability;
    private Boolean mlPredictedFailure;
    private String mlPredictionTimestamp;
    private String mlModelVersion;
    private String mlConfidenceLevel;
    private Integer mlPredictionLatencyMs;
}

