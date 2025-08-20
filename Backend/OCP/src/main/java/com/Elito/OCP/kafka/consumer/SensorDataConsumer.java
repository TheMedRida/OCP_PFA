package com.Elito.OCP.kafka.consumer;

import com.Elito.OCP.kafka.config.KafkaTopics;
import com.Elito.OCP.kafka.entity.SensorReading;
import com.Elito.OCP.kafka.repository.SensorReadingRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class SensorDataConsumer {
    private final SensorReadingRepository repository;
    private final ObjectMapper objectMapper;
    private static final DateTimeFormatter formatter =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @KafkaListener(topics = KafkaTopics.SENSOR_DATA, groupId = "intervention-group")
    public void consume(String message) {
        try {
            JsonNode data = objectMapper.readTree(message);

            SensorReading reading = new SensorReading();

            // Timestamp and Identification
            reading.setTimestamp(LocalDateTime.parse(data.path("Timestamp").asText(), formatter));
            reading.setMachineId(data.path("Machine_ID").asText());
            reading.setMachineType(data.path("Machine_Type").asText());
            reading.setProductionLineId(data.path("Production_Line_ID").asText());
            reading.setOperationalMode(data.path("Operational_Mode").asText());
            reading.setJobCode(data.path("Job_Code").asText());

            // Vibration Metrics
            reading.setVibrationX(data.path("Vibration_X").asDouble());
            reading.setVibrationY(data.path("Vibration_Y").asDouble());
            reading.setVibrationZ(data.path("Vibration_Z").asDouble());
            reading.setRmsVibration(data.path("RMS_Vibration").asDouble());
            reading.setPeakVibration(data.path("Peak_Vibration").asDouble());

            // Temperature Metrics
            reading.setBearingTemperature(data.path("Bearing_Temperature").asDouble());
            reading.setMotorTemperature(data.path("Motor_Temperature").asDouble());
            reading.setGearboxTemperature(data.path("Gearbox_Temperature").asDouble());
            reading.setOilTemperature(data.path("Oil_Temperature").asDouble());
            reading.setCoolantTemperature(data.path("Coolant_Temperature").asDouble());

            // Oil and Fluid Metrics
            reading.setOilViscosity(data.path("Oil_Viscosity").asDouble());
            reading.setOilParticleCount(data.path("Oil_Particle_Count").asDouble());
            reading.setCoolantFlowRate(data.path("Coolant_Flow_Rate").asDouble());

            // Acoustic and Signal Metrics
            reading.setAcousticEmissionLevel(data.path("Acoustic_Emission_Level").asDouble());
            reading.setUltrasonicSignalStrength(data.path("Ultrasonic_Signal_Strength").asDouble());
            reading.setMagneticFieldStrength(data.path("Magnetic_Field_Strength").asDouble());

            // Pressure and Flow Metrics
            reading.setHydraulicPressure(data.path("Hydraulic_Pressure").asDouble());
            reading.setPneumaticPressure(data.path("Pneumatic_Pressure").asDouble());
            reading.setAirFlowRate(data.path("Air_Flow_Rate").asDouble());
            reading.setInternalHumidity(data.path("Internal_Humidity").asDouble());

            // Electrical Metrics
            reading.setVoltagePhaseA(data.path("Voltage_Phase_A").asDouble());
            reading.setVoltagePhaseB(data.path("Voltage_Phase_B").asDouble());
            reading.setVoltagePhaseC(data.path("Voltage_Phase_C").asDouble());
            reading.setCurrentPhaseA(data.path("Current_Phase_A").asDouble());
            reading.setCurrentPhaseB(data.path("Current_Phase_B").asDouble());
            reading.setCurrentPhaseC(data.path("Current_Phase_C").asDouble());
            reading.setPowerFactor(data.path("Power_Factor").asDouble());
            reading.setPowerConsumption(data.path("Power_Consumption").asDouble());
            reading.setEnergyEfficiencyIndex(data.path("Energy_Efficiency_Index").asDouble());

            // Mechanical Metrics
            reading.setShaftSpeedRpm(data.path("Shaft_Speed_RPM").asDouble());
            reading.setLoadTorque(data.path("Load_Torque").asDouble());
            reading.setShaftAlignmentStatus(data.path("Shaft_Alignment_Status").asInt());

            // Production Metrics
            reading.setCycleTime(data.path("Cycle_Time").asDouble());
            reading.setProductionRate(data.path("Production_Rate").asDouble());
            reading.setScrapRate(data.path("Scrap_Rate").asDouble());
            reading.setDefectiveCount(data.path("Defective_Count").asDouble());
            reading.setUtilizationPercentage(data.path("Utilization_Percentage").asDouble());

            // Machine Operation Metrics
            reading.setToolChangeCount(data.path("Tool_Change_Count").asDouble());
            reading.setMachineStartStopCycles(data.path("Machine_Start_Stop_Cycles").asDouble());
            reading.setTimeSinceLastOperation(data.path("Time_Since_Last_Operation").asDouble());
            reading.setToolWearLevel(data.path("Tool_Wear_Level").asDouble());
            reading.setWorkloadPercentage(data.path("Workload_Percentage").asDouble());
            reading.setIdleTimeDuration(data.path("Idle_Time_Duration").asDouble());

            // Maintenance Metrics
            reading.setLastMaintenanceDate(data.path("Last_Maintenance_Date").asText());
            reading.setMaintenanceFrequency(data.path("Maintenance_Frequency").asText());
            reading.setMaintenanceType(data.path("Maintenance_Type").asText());
            reading.setMaintenanceDuration(data.path("Maintenance_Duration").asDouble());
            reading.setMaintenancePersonnelId(data.path("Maintenance_Personnel_ID").asText());

            // Failure Metrics
            reading.setFailureOccurrence(data.path("Failure_Occurrence").asInt());
            reading.setFailureTimestamp(data.path("Failure_Timestamp").asText());
            reading.setFailureType(data.path("Failure_Type").asText());
            reading.setFaultCode(data.path("Fault_Code").asText());
            reading.setDiagnosticCode(data.path("Diagnostic_Code").asText());
            reading.setNumberOfPastFailures(data.path("Number_of_Past_Failures").asDouble());
            reading.setComponentHealthScore(data.path("Component_Health_Score").asDouble());
            reading.setDowntimeDuration(data.path("Downtime_Duration").asDouble());
            reading.setReplacedComponentsList(data.path("Replaced_Components_List").asText());

            // Environmental Metrics
            reading.setAmbientTemperature(data.path("Ambient_Temperature").asDouble());
            reading.setAmbientHumidity(data.path("Ambient_Humidity").asDouble());
            reading.setDustConcentration(data.path("Dust_Concentration").asDouble());
            reading.setExternalVibrationExposure(data.path("External_Vibration_Exposure").asDouble());

            // Operational Context
            reading.setShiftCode(data.path("Shift_Code").asText());
            reading.setOperatorId(data.path("Operator_ID").asText());
            reading.setMachineLocationZone(data.path("Machine_Location_Zone").asText());
            reading.setNearbyMachineLoad(data.path("Nearby_Machine_Load").asDouble());
            reading.setLightingCondition(data.path("Lighting_Condition").asDouble());
            reading.setVentilationLevel(data.path("Ventilation_Level").asDouble());
            reading.setSoundPressureLevel(data.path("Sound_Pressure_Level").asDouble());

            // Alert and Event Metrics
            reading.setTimeSinceLastAlert(data.path("Time_Since_Last_Alert").asDouble());
            reading.setAlertType(data.path("Alert_Type").asText());
            reading.setAlarmCount24hr(data.path("Alarm_Count_24hr").asDouble());
            reading.setLastResetTimestamp(data.path("Last_Reset_Timestamp").asText());
            reading.setEventSequenceNumber(data.path("Event_Sequence_Number").asInt());
            reading.setErrorCodeHistory(data.path("Error_Code_History").asText());

            // Connectivity Metrics
            reading.setSensorPingRate(data.path("Sensor_Ping_Rate").asDouble());
            reading.setDataPacketLossPercent(data.path("Data_Packet_Loss_Percent").asDouble());
            reading.setCommunicationLatency(data.path("Communication_Latency").asDouble());
            reading.setNetworkBandwidthUsage(data.path("Network_Bandwidth_Usage").asDouble());
            reading.setDeviceBatteryLevel(data.path("Device_Battery_Level").asDouble());
            reading.setEdgeProcessingTime(data.path("Edge_Processing_Time").asDouble());

            // Predictive Maintenance Metrics
            reading.setRul(data.path("RUL").asDouble());
            reading.setTtf(data.path("TTF").asDouble());
            reading.setFailureProbability(data.path("Failure_Probability").asDouble());
            reading.setMaintenanceTypeLabel(data.path("Maintenance_Type_Label").asText());
            reading.setFailureComponentClass(data.path("Failure_Component_Class").asText());

            // Check for duplicates and save
            if (!repository.existsByTimestamp(reading.getTimestamp())) {
                repository.save(reading);
                log.info("Saved sensor data for machine: {} at {}", reading.getMachineId(), reading.getTimestamp());
            } else {
                log.info("Skipped duplicate data for machine: {} at {}", reading.getMachineId(), reading.getTimestamp());
            }

        } catch (Exception e) {
            log.error("Error processing message: {}", message, e);
        }
    }
}




/*package com.Elito.OCP.kafka.consumer;

import com.Elito.OCP.kafka.config.KafkaTopics;
import com.Elito.OCP.kafka.entity.SensorReading;
import com.Elito.OCP.kafka.repository.SensorReadingRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;



@Slf4j
@Service
@RequiredArgsConstructor
public class SensorDataConsumer {
    private final SensorReadingRepository repository;
    private final ObjectMapper objectMapper;
    private static final DateTimeFormatter formatter =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @KafkaListener(topics = KafkaTopics.SENSOR_DATA, groupId = "intervention-group")
    public void consume(String message) {
        try {
            JsonNode data = objectMapper.readTree(message);

            SensorReading reading = new SensorReading();
            reading.setMachineId(data.path("Machine_ID").asText());
            reading.setTimestamp(LocalDateTime.parse(
                    data.path("Timestamp").asText(), formatter));
            reading.setVibrationX(data.path("Vibration_X").asDouble());
            reading.setMotorTemperature(data.path("Motor_Temperature").asDouble());
            reading.setFailureProbability(data.path("Failure_Probability").asDouble());

            //repository.save(reading);

            if (!repository.existsByTimestamp(reading.getTimestamp())) {
                repository.save(reading);
                log.info("Saved sensor data for machine: {}", reading.getMachineId());
            }else{
                log.info("NO Save sensor data (Duplicated data) for machine: {}", reading.getMachineId());
            }

        } catch (Exception e) {
            log.error("Error processing message: {}", message, e);
        }
    }
}*/


/*
@Slf4j
@Service
@RequiredArgsConstructor
public class SensorDataConsumer {
    private final SensorReadingRepository repository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = KafkaTopics.SENSOR_DATA, groupId = "intervention-group")
    public void consume(String message) {
        try {
            JsonNode data = objectMapper.readTree(message);

            SensorReading reading = new SensorReading();

            repository.save(reading);

        } catch (Exception e) {
            log.error("Error processing message: {}", message, e);
        }
    }
}
*/

