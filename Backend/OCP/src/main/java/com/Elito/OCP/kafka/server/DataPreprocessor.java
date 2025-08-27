package com.Elito.OCP.kafka.server;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class DataPreprocessor {

    // Your categorical columns (EXCLUDING Shaft_Alignment_Status - it's numerical!)
    private final List<String> CATEGORICAL_COLUMNS = Arrays.asList(
            "Machine_ID", "Machine_Type", "Production_Line_ID", "Operational_Mode",
            "Job_Code", "Maintenance_Frequency", "Maintenance_Personnel_ID",
            "Fault_Code", "Diagnostic_Code", "Shift_Code", "Operator_ID",
            "Machine_Location_Zone", "Error_Code_History"
    );

    // Your numerical columns (INCLUDING Shaft_Alignment_Status)
    private final List<String> NUMERICAL_COLUMNS = Arrays.asList(
            "Vibration_X", "Vibration_Y", "Vibration_Z", "RMS_Vibration",
            "Peak_Vibration", "Bearing_Temperature", "Motor_Temperature",
            "Gearbox_Temperature", "Shaft_Alignment_Status", "Oil_Temperature",
            "Oil_Viscosity", "Oil_Particle_Count", "Coolant_Temperature",
            "Coolant_Flow_Rate", "Acoustic_Emission_Level",
            "Ultrasonic_Signal_Strength", "Magnetic_Field_Strength",
            "Hydraulic_Pressure", "Pneumatic_Pressure", "Air_Flow_Rate",
            "Internal_Humidity", "Voltage_Phase_A", "Voltage_Phase_B",
            "Voltage_Phase_C", "Current_Phase_A", "Current_Phase_B",
            "Current_Phase_C", "Power_Factor", "Power_Consumption",
            "Energy_Efficiency_Index", "Shaft_Speed_RPM", "Load_Torque",
            "Cycle_Time", "Production_Rate", "Scrap_Rate", "Defective_Count",
            "Utilization_Percentage", "Tool_Change_Count",
            "Machine_Start_Stop_Cycles", "Time_Since_Last_Operation",
            "Tool_Wear_Level", "Workload_Percentage", "Idle_Time_Duration",
            "Maintenance_Duration", "Number_of_Past_Failures",
            "Component_Health_Score", "Downtime_Duration", "Ambient_Temperature",
            "Ambient_Humidity", "Dust_Concentration", "External_Vibration_Exposure",
            "Nearby_Machine_Load", "Lighting_Condition", "Ventilation_Level",
            "Sound_Pressure_Level", "Time_Since_Last_Alert", "Alarm_Count_24hr",
            "Event_Sequence_Number", "Sensor_Ping_Rate", "Data_Packet_Loss_Percent",
            "Communication_Latency", "Network_Bandwidth_Usage",
            "Device_Battery_Level", "Edge_Processing_Time"
    );

    // Mapping of categorical values to their dummy column names
    private final Map<String, Map<String, String>> CATEGORY_VALUE_MAPPING = new HashMap<>();
    private final Map<String, List<String>> CATEGORY_ORDER = new HashMap<>();

    public DataPreprocessor() {
        initializeCategoryMappings();
    }

    private void initializeCategoryMappings() {
        // Machine_ID mappings (4 unique values: M001, M002, M003, M004)
        Map<String, String> machineIdMapping = new HashMap<>();
        machineIdMapping.put("M002", "Machine_ID_M002");
        machineIdMapping.put("M003", "Machine_ID_M003");
        machineIdMapping.put("M004", "Machine_ID_M004");
        CATEGORY_VALUE_MAPPING.put("Machine_ID", machineIdMapping);
        CATEGORY_ORDER.put("Machine_ID", Arrays.asList("M001", "M002", "M003", "M004"));

        // Machine_Type mappings (3 unique values: CNC, Lathe, Milling)
        Map<String, String> machineTypeMapping = new HashMap<>();
        machineTypeMapping.put("Lathe", "Machine_Type_Lathe");
        machineTypeMapping.put("Milling", "Machine_Type_Milling");
        CATEGORY_VALUE_MAPPING.put("Machine_Type", machineTypeMapping);
        CATEGORY_ORDER.put("Machine_Type", Arrays.asList("CNC", "Lathe", "Milling"));

        // Production_Line_ID mappings (3 unique values: L1, L2, L3)
        Map<String, String> productionLineMapping = new HashMap<>();
        productionLineMapping.put("L2", "Production_Line_ID_L2");
        productionLineMapping.put("L3", "Production_Line_ID_L3");
        CATEGORY_VALUE_MAPPING.put("Production_Line_ID", productionLineMapping);
        CATEGORY_ORDER.put("Production_Line_ID", Arrays.asList("L1", "L2", "L3"));

        // Operational_Mode mappings (3 unique values: Auto, Manual, Semi)
        Map<String, String> operationalModeMapping = new HashMap<>();
        operationalModeMapping.put("Manual", "Operational_Mode_Manual");
        operationalModeMapping.put("Semi", "Operational_Mode_Semi");
        CATEGORY_VALUE_MAPPING.put("Operational_Mode", operationalModeMapping);
        CATEGORY_ORDER.put("Operational_Mode", Arrays.asList("Auto", "Manual", "Semi"));

        // Job_Code mappings (4 unique values: J101, J202, J303, J404)
        Map<String, String> jobCodeMapping = new HashMap<>();
        jobCodeMapping.put("J202", "Job_Code_J202");
        jobCodeMapping.put("J303", "Job_Code_J303");
        jobCodeMapping.put("J404", "Job_Code_J404");
        CATEGORY_VALUE_MAPPING.put("Job_Code", jobCodeMapping);
        CATEGORY_ORDER.put("Job_Code", Arrays.asList("J101", "J202", "J303", "J404"));

        // Maintenance_Frequency mappings (3 unique values: Daily, Monthly, Weekly)
        Map<String, String> maintenanceFreqMapping = new HashMap<>();
        maintenanceFreqMapping.put("Monthly", "Maintenance_Frequency_Monthly");
        maintenanceFreqMapping.put("Weekly", "Maintenance_Frequency_Weekly");
        CATEGORY_VALUE_MAPPING.put("Maintenance_Frequency", maintenanceFreqMapping);
        CATEGORY_ORDER.put("Maintenance_Frequency", Arrays.asList("Daily", "Monthly", "Weekly"));

        // Maintenance_Personnel_ID mappings (3 unique values: T1, T2, T3)
        Map<String, String> personnelMapping = new HashMap<>();
        personnelMapping.put("T2", "Maintenance_Personnel_ID_T2");
        personnelMapping.put("T3", "Maintenance_Personnel_ID_T3");
        CATEGORY_VALUE_MAPPING.put("Maintenance_Personnel_ID", personnelMapping);
        CATEGORY_ORDER.put("Maintenance_Personnel_ID", Arrays.asList("T1", "T2", "T3"));

        // Fault_Code mappings (4 unique values: F0, F1, F2, F3)
        Map<String, String> faultCodeMapping = new HashMap<>();
        faultCodeMapping.put("F1", "Fault_Code_F1");
        faultCodeMapping.put("F2", "Fault_Code_F2");
        faultCodeMapping.put("F3", "Fault_Code_F3");
        CATEGORY_VALUE_MAPPING.put("Fault_Code", faultCodeMapping);
        CATEGORY_ORDER.put("Fault_Code", Arrays.asList("F0", "F1", "F2", "F3"));

        // Diagnostic_Code mappings (3 unique values: D0, D1, D2)
        Map<String, String> diagnosticCodeMapping = new HashMap<>();
        diagnosticCodeMapping.put("D1", "Diagnostic_Code_D1");
        diagnosticCodeMapping.put("D2", "Diagnostic_Code_D2");
        CATEGORY_VALUE_MAPPING.put("Diagnostic_Code", diagnosticCodeMapping);
        CATEGORY_ORDER.put("Diagnostic_Code", Arrays.asList("D0", "D1", "D2"));

        // Shift_Code mappings (2 unique values: Day, Night)
        Map<String, String> shiftCodeMapping = new HashMap<>();
        shiftCodeMapping.put("Night", "Shift_Code_Night");
        CATEGORY_VALUE_MAPPING.put("Shift_Code", shiftCodeMapping);
        CATEGORY_ORDER.put("Shift_Code", Arrays.asList("Day", "Night"));

        // Operator_ID mappings (4 unique values: O1, O2, O3, O4)
        Map<String, String> operatorMapping = new HashMap<>();
        operatorMapping.put("O2", "Operator_ID_O2");
        operatorMapping.put("O3", "Operator_ID_O3");
        operatorMapping.put("O4", "Operator_ID_O4");
        CATEGORY_VALUE_MAPPING.put("Operator_ID", operatorMapping);
        CATEGORY_ORDER.put("Operator_ID", Arrays.asList("O1", "O2", "O3", "O4"));

        // Machine_Location_Zone mappings (3 unique values: Z1, Z2, Z3)
        Map<String, String> locationMapping = new HashMap<>();
        locationMapping.put("Z2", "Machine_Location_Zone_Z2");
        locationMapping.put("Z3", "Machine_Location_Zone_Z3");
        CATEGORY_VALUE_MAPPING.put("Machine_Location_Zone", locationMapping);
        CATEGORY_ORDER.put("Machine_Location_Zone", Arrays.asList("Z1", "Z2", "Z3"));

        // Error_Code_History mappings (3 unique values: E0, E1, E2)
        Map<String, String> errorHistoryMapping = new HashMap<>();
        errorHistoryMapping.put("E1", "Error_Code_History_E1");
        errorHistoryMapping.put("E2", "Error_Code_History_E2");
        CATEGORY_VALUE_MAPPING.put("Error_Code_History", errorHistoryMapping);
        CATEGORY_ORDER.put("Error_Code_History", Arrays.asList("E0", "E1", "E2"));
    }

    public double[] preprocessForModel(Map<String, Object> rawData) {
        // Create feature array with 93 elements (all zeros initially)
        double[] features = new double[93];
        int featureIndex = 0;

        System.out.println("Available keys in raw data: " + rawData.keySet());

        // 1. Process NUMERICAL features in EXACT order (64 features)
        for (String numericalCol : NUMERICAL_COLUMNS) {
            if (featureIndex >= features.length) {
                throw new RuntimeException("Feature index out of bounds: " + featureIndex);
            }
            double value = getDoubleValue(rawData, numericalCol);
            features[featureIndex++] = value;
            System.out.println("Numerical [" + numericalCol + "]: " + value);
        }

        // 2. Process CATEGORICAL features using one-hot encoding (29 features)
        for (String catColumn : CATEGORICAL_COLUMNS) {
            String value = getStringValue(rawData, catColumn);
            List<String> expectedOrder = CATEGORY_ORDER.get(catColumn);

            if (expectedOrder != null) {
                System.out.println("Categorical [" + catColumn + "]: " + value);
                System.out.println("  Expected order: " + expectedOrder);
                System.out.println("  Number of one-hot features to create: " + (expectedOrder.size() - 1));

                // Apply drop_first: skip the first category (reference category)
                for (int i = 1; i < expectedOrder.size(); i++) {
                    if (featureIndex >= features.length) {
                        throw new RuntimeException("Feature index out of bounds: " + featureIndex);
                    }
                    String expectedValue = expectedOrder.get(i);
                    // Set 1.0 if this is the active category, 0.0 otherwise
                    double oneHotValue = expectedValue.equals(value) ? 1.0 : 0.0;
                    features[featureIndex++] = oneHotValue;
                    System.out.println("  One-hot [" + catColumn + "_" + expectedValue + "]: " + oneHotValue);
                }
            }
        }

        System.out.println("Total features processed: " + featureIndex);

        // Validate we filled exactly 93 features
        if (featureIndex != 93) {
            throw new RuntimeException("Feature dimension mismatch. Expected: 93, Got: " + featureIndex);
        }

        return features;
    }

    private double getDoubleValue(Map<String, Object> data, String key) {
        if (!data.containsKey(key)) {
            System.out.println("WARNING: Missing numerical field: " + key);
            return 0.0; // Return default value for missing fields
        }

        Object value = data.get(key);
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        } else if (value instanceof String) {
            try {
                return Double.parseDouble((String) value);
            } catch (NumberFormatException e) {
                return 0.0;
            }
        }
        return 0.0;
    }

    private String getStringValue(Map<String, Object> data, String key) {
        if (!data.containsKey(key)) {
            System.out.println("WARNING: Missing categorical field: " + key);
            return ""; // Return empty string for missing fields
        }

        Object value = data.get(key);
        return value != null ? value.toString() : "";
    }
}