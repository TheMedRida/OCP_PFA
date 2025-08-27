package com.Elito.OCP.kafka.server;

import ai.onnxruntime.*;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import java.io.InputStream;

@Service
public class ModelLoaderService {
    private OrtSession session;
    private OrtEnvironment environment;
    private String modelVersion = "v1.0-production";

    @PostConstruct
    public void loadModel() {
        try {
            environment = OrtEnvironment.getEnvironment();
            OrtSession.SessionOptions sessionOptions = new OrtSession.SessionOptions();

            // Load ONNX model from classpath
            ClassPathResource resource = new ClassPathResource("models/LightGBM_Tmodel.onnx");
            System.out.println("Looking for model at: " + resource.getPath());
            System.out.println("Model exists: " + resource.exists());

            if (!resource.exists()) {
                throw new RuntimeException("Model file not found at: " + resource.getPath());
            }

            try (InputStream modelStream = resource.getInputStream()) {
                byte[] modelBytes = modelStream.readAllBytes();
                System.out.println("Model file size: " + modelBytes.length + " bytes");
                session = environment.createSession(modelBytes, sessionOptions);
            }

            System.out.println("✅ ONNX Model loaded successfully: " + modelVersion);
            printModelInfo(); // Debug: print model information

        } catch (Exception e) {
            System.err.println("❌ Failed to load ONNX model: " + e.getMessage());
            e.printStackTrace();
            session = null;
        }
    }

    public OrtSession getSession() {
        return session;
    }

    public OrtEnvironment getEnvironment() {
        return environment;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public boolean isModelLoaded() {
        return session != null;
    }

    public void printModelInfo() {
        if (session != null) {
            try {
                System.out.println("=== ONNX Model Information ===");
                System.out.println("Input names: " + session.getInputNames());
                System.out.println("Output names: " + session.getOutputNames());

                // Print input info
                for (String inputName : session.getInputNames()) {
                    NodeInfo inputInfo = session.getInputInfo().get(inputName);
                    System.out.println("Input: " + inputName + " - " + inputInfo.getInfo());
                }

                // Print output info
                for (String outputName : session.getOutputNames()) {
                    NodeInfo outputInfo = session.getOutputInfo().get(outputName);
                    System.out.println("Output: " + outputName + " - " + outputInfo.getInfo());
                }

            } catch (Exception e) {
                System.err.println("Failed to get model info: " + e.getMessage());
            }
        }
    }
}