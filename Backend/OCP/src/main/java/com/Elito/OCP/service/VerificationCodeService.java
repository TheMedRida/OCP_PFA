package com.Elito.OCP.service;

import com.Elito.OCP.domain.VerificationType;
import com.Elito.OCP.model.User;
import com.Elito.OCP.model.VerificationCode;

public interface VerificationCodeService {

    VerificationCode sendVerificationCode(User user , VerificationType verificationType);

    VerificationCode getVerificationCodeById(Long id) throws Exception;

    VerificationCode  getVerificationCodeByUser(Long userId);

    void deleteVerificationCodeById(VerificationCode verificationCode);
}
