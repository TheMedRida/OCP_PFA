package com.Elito.OCP.service;

import com.Elito.OCP.domain.VerificationType;
import com.Elito.OCP.model.ForgotPasswordToken;
import com.Elito.OCP.model.User;

public interface ForgotPasswordService {


    ForgotPasswordToken createToken(User user, String id , String otp , VerificationType verificationType , String sendTo );

    ForgotPasswordToken findById (String  id);

    ForgotPasswordToken findByUser(Long userId);

    void deleteToken(ForgotPasswordToken token);

    // add recently
    void deleteByUserId(Long userId);


}
