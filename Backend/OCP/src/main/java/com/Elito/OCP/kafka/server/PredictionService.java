package com.Elito.OCP.kafka.server;

import ai.onnxruntime.*;
import org.springframework.stereotype.Service;

import java.nio.FloatBuffer;
import java.util.*;
import ai.onnxruntime.OnnxMap;
import ai.onnxruntime.OnnxValue;
import ai.onnxruntime.OrtSession;
import ai.onnxruntime.OrtException;

@Service
public class PredictionService {

    private final ModelLoaderService modelLoader;
    private final DataPreprocessor dataPreprocessor;

    public PredictionService(ModelLoaderService modelLoader, DataPreprocessor dataPreprocessor) {
        this.modelLoader = modelLoader;
        this.dataPreprocessor = dataPreprocessor;
    }

    public Map<String, Object> predictFailure(Map<String, Object> rawSensorData) {
        Map<String, Object> predictionResult = new HashMap<>();
        long startTime = System.currentTimeMillis();

        try {
            // Check if model is loaded
            if (!modelLoader.isModelLoaded()) {
                throw new RuntimeException("ONNX model is not loaded");
            }

            // 1. Preprocess data
            double[] features = dataPreprocessor.preprocessForModel(rawSensorData);

            System.out.println("Making prediction with " + features.length + " features");

            // 2. Make prediction and get both probability and binary prediction
            Map<String, Object> predictions = makeOnnxPrediction(features);
            double probability = (Double) predictions.get("failureProbability");
            boolean willFail = (Boolean) predictions.get("binaryPrediction");

            // 3. Prepare result
            predictionResult.put("mlFailureProbability", probability);
            predictionResult.put("mlPredictedFailure", willFail);
            predictionResult.put("mlModelVersion", modelLoader.getModelVersion());
            predictionResult.put("mlConfidenceLevel", getConfidenceLevel(probability));
            predictionResult.put("mlPredictionLatencyMs", (int)(System.currentTimeMillis() - startTime));
            predictionResult.put("mlProcessingSuccessful", true);

        } catch (Exception e) {
            System.err.println("Prediction error: " + e.getMessage());
            e.printStackTrace();
            prepareErrorResult(predictionResult, e, startTime);
        }

        return predictionResult;
    }

    private Map<String, Object> makeOnnxPrediction(double[] features) throws OrtException {
        OrtSession session = modelLoader.getSession();
        String inputName = session.getInputNames().iterator().next();

        // Convert double[] to float[] for ONNX
        float[] floatFeatures = new float[features.length];
        for (int i = 0; i < features.length; i++) {
            floatFeatures[i] = (float) features[i];
        }

        // Create input tensor with shape [1, 93]
        long[] shape = {1, features.length};
        OnnxTensor tensor = OnnxTensor.createTensor(
                modelLoader.getEnvironment(),
                FloatBuffer.wrap(floatFeatures),
                shape
        );

        // Run inference
        try (OrtSession.Result results = session.run(Collections.singletonMap(inputName, tensor))) {
            return extractPredictions(results);
        }
    }

    private Map<String, Object> extractPredictions(OrtSession.Result results) throws OrtException {
        Map<String, Object> predictions = new HashMap<>();

        // Get binary prediction (0 or 1) from "label" output
        OnnxValue labelValue = results.get("label").orElseThrow(() ->
                new OrtException("Label output not found in model results"));

        long[] labelArray = (long[]) labelValue.getValue();
        long binaryPrediction = labelArray[0];
        predictions.put("binaryPrediction", binaryPrediction == 1L);

        // Get probability of failure from "probabilities" output
        OnnxValue probabilitiesValue = results.get("probabilities").orElseThrow(() ->
                new OrtException("Probabilities output not found in model results"));

        Object probabilitiesObject = probabilitiesValue.getValue();
        System.out.println("Probabilities object type: " + probabilitiesObject.getClass().getName());
        System.out.println("Probabilities object: " + probabilitiesObject);

        double failureProbability = 0.0;

        // Approach for ONNXMap wrapped in a List
        if (probabilitiesObject instanceof List) {
            List<?> list = (List<?>) probabilitiesObject;
            System.out.println("Approach - List: " + list);

            if (list.size() > 0 && list.get(0) instanceof OnnxMap) {
                OnnxMap onnxMap = (OnnxMap) list.get(0);
                System.out.println("Approach - OnnxMap: " + onnxMap);

                try {
                    // Convert OnnxMap to a regular Java Map using the proper API
                    // First, let's try to get the underlying map using the value extraction
                    Map<Long, Float> probabilityMap = new HashMap<>();

                    // Since OnnxMap doesn't provide direct access methods, let's use a different approach
                    // We can convert the OnnxMap to a string and parse it, or use reflection as last resort
                    String mapString = onnxMap.toString();
                    System.out.println("Map as string: " + mapString);

                    // Parse the string representation to extract probabilities
                    // The format is: ONNXMap(size=2,info=MapInfo(size=2,keyType=INT64,valueType=FLOAT))
                    // But we need the actual values. Let's try a different approach.

                    // Alternative: Use the fact that OnnxMap implements getValue() for the entire map
                    Object mapValue = onnxMap.getValue();
                    System.out.println("Map value type: " + (mapValue != null ? mapValue.getClass().getName() : "null"));
                    System.out.println("Map value: " + mapValue);

                    if (mapValue instanceof Map) {
                        // If we get a Map directly, use it
                        Map<?, ?> rawMap = (Map<?, ?>) mapValue;
                        for (Map.Entry<?, ?> entry : rawMap.entrySet()) {
                            if (entry.getKey() instanceof Long && entry.getValue() instanceof Float) {
                                probabilityMap.put((Long) entry.getKey(), (Float) entry.getValue());
                            }
                        }
                    } else {
                        // Fallback: Use reflection to access the internal map
                        try {
                            java.lang.reflect.Field mapField = onnxMap.getClass().getDeclaredField("map");
                            mapField.setAccessible(true);
                            Map<Long, Float> internalMap = (Map<Long, Float>) mapField.get(onnxMap);
                            probabilityMap.putAll(internalMap);
                        } catch (NoSuchFieldException | IllegalAccessException e) {
                            throw new OrtException("Failed to access OnnxMap internal structure: " + e.getMessage());
                        }
                    }

                    System.out.println("Extracted probability map: " + probabilityMap);

                    // Get the probability for class 1 (failure)
                    if (probabilityMap.containsKey(1L)) {
                        failureProbability = probabilityMap.get(1L);
                    } else if (probabilityMap.containsKey(0L)) {
                        // If only class 0 probability is provided, calculate class 1 as 1 - class 0
                        failureProbability = 1.0 - probabilityMap.get(0L);
                    } else {
                        throw new OrtException("Map doesn't contain expected keys (0 or 1). Found keys: " + probabilityMap.keySet());
                    }

                    System.out.println("Failure probability: " + failureProbability);

                } catch (Exception e) {
                    throw new OrtException("Failed to extract value from OnnxMap: " + e.getMessage());
                }
            }
        }
        // Other approaches for different output formats...
        else if (probabilitiesObject instanceof float[][]) {
            float[][] probArray = (float[][]) probabilitiesObject;
            if (probArray.length > 0 && probArray[0].length >= 2) {
                failureProbability = probArray[0][1];
            }
        }
        else if (probabilitiesObject instanceof double[][]) {
            double[][] probArray = (double[][]) probabilitiesObject;
            if (probArray.length > 0 && probArray[0].length >= 2) {
                failureProbability = probArray[0][1];
            }
        }
        else {
            throw new OrtException("Unsupported probabilities format: " +
                    probabilitiesObject.getClass().getName());
        }

        predictions.put("failureProbability", failureProbability);
        System.out.println("Binary prediction: " + binaryPrediction);
        System.out.println("Final failure probability: " + failureProbability);

        return predictions;
    }

    private String getConfidenceLevel(double probability) {
        double distanceFromThreshold = Math.abs(probability - 0.5);
        if (distanceFromThreshold > 0.3) return "VERY_HIGH";
        if (distanceFromThreshold > 0.2) return "HIGH";
        if (distanceFromThreshold > 0.1) return "MEDIUM";
        return "LOW";
    }

    private void prepareErrorResult(Map<String, Object> result, Exception e, long startTime) {
        result.put("mlFailureProbability", 0.0);
        result.put("mlPredictedFailure", false);
        result.put("mlModelVersion", "error");
        result.put("mlConfidenceLevel", "LOW");
        result.put("mlPredictionLatencyMs", (int)(System.currentTimeMillis() - startTime));
        result.put("mlProcessingSuccessful", false);
        result.put("mlError", e.getMessage());
    }
}