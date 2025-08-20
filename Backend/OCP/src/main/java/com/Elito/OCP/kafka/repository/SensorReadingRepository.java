package com.Elito.OCP.kafka.repository;


import com.Elito.OCP.kafka.entity.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;


public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {
    boolean existsByTimestamp(LocalDateTime timestamp);
}
