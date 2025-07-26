package com.Elito.OCP.repository;

import com.Elito.OCP.model.ForgotPasswordToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ForgotPasswordRepository extends JpaRepository<ForgotPasswordToken , String> {

    ForgotPasswordToken findByUserId(Long userId);

}
