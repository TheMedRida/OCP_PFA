package com.Elito.OCP.kafka.producer;

import com.Elito.OCP.kafka.config.KafkaTopics;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class SensorDataProducer {
    private final KafkaTemplate<String, String> kafkaTemplate;

    public SensorDataProducer(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendSensorData(String message) {
        kafkaTemplate.send(KafkaTopics.SENSOR_DATA, message);
    }
}