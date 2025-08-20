package com.Elito.OCP.kafka.consumer;

import com.Elito.OCP.kafka.producer.SensorDataProducer;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;

@Component
public class StreamListener {
    private final SensorDataProducer producer;
    private final WebClient webClient;

    public StreamListener(SensorDataProducer producer) {
        this.producer = producer;
        this.webClient = WebClient.builder()
                .baseUrl("http://127.0.0.1:8000")
                .build();
    }

    @EventListener(ApplicationReadyEvent.class)
    public void startListening() {
        webClient.get()
                .uri("/api/stream")
                .retrieve()
                .bodyToFlux(String.class)
                .retryWhen(Retry.fixedDelay(Long.MAX_VALUE, Duration.ofSeconds(5))
                        .doBeforeRetry(retry -> System.out.println("Retrying connection...")))
                .subscribe(
                        producer::sendSensorData,
                        error -> System.err.println("Stream error: " + error.getMessage()),
                        () -> System.out.println("Stream completed")
                );
    }
}

/*@Component
public class StreamListener {
    private final SensorDataProducer producer;
    private final WebClient webClient;

    public StreamListener(SensorDataProducer producer) {
        this.producer = producer;
        this.webClient = WebClient.create("http://127.0.0.1:8000");
    }

    @EventListener(ApplicationReadyEvent.class)
    public void startListening() {
        webClient.get()
                .uri("/api/stream")
                .retrieve()
                .bodyToFlux(String.class)
                .subscribe(message -> {
                    if (message.startsWith("data: ")) {
                        producer.sendSensorData(message.substring(6).trim());
                    }
                });
    }
}*/