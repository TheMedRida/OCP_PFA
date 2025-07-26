package com.Elito.OCP.service;

import com.Elito.OCP.model.TwoFactorOTP;
import com.Elito.OCP.model.User;

public interface TwoFactorOtpService {

    TwoFactorOTP createTwoFactorOtp(User user , String otp , String jwt);

    TwoFactorOTP findByUser(Long userId);

    TwoFactorOTP findById(String id);

    boolean verifyTwoFactorOtp(TwoFactorOTP twoFactorOTP, String otp);

    void deleteTwoFactorOtp(TwoFactorOTP twoFactorOTP);






}
