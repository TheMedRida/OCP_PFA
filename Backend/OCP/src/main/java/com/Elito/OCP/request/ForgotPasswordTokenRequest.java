package com.Elito.OCP.request;

import com.Elito.OCP.domain.VerificationType;
import lombok.Data;

@Data
public class ForgotPasswordTokenRequest {
    private String sendTo ;
    private VerificationType verificationType;
}
