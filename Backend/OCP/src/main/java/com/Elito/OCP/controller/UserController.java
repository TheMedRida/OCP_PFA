package com.Elito.OCP.controller;


import com.Elito.OCP.config.JwtConstant;
import com.Elito.OCP.domain.VerificationType;
import com.Elito.OCP.model.ForgotPasswordToken;
import com.Elito.OCP.request.ForgotPasswordTokenRequest;
import com.Elito.OCP.model.User;
import com.Elito.OCP.model.VerificationCode;
import com.Elito.OCP.request.ResetPasswordRequest;
import com.Elito.OCP.response.ApiResponse;
import com.Elito.OCP.response.AuthResponse;
import com.Elito.OCP.service.EmailService;
import com.Elito.OCP.service.ForgotPasswordService;
import com.Elito.OCP.service.UserService;
import com.Elito.OCP.service.VerificationCodeService;
import com.Elito.OCP.utils.OtpUtils;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.UUID;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private VerificationCodeService verificationCodeService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ForgotPasswordService forgotPasswordService;


    @GetMapping("/api/users/profile")
    public ResponseEntity<User> getUserProfile(@RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);

        return new ResponseEntity<User>(user , HttpStatus.OK);
    }

    @PostMapping("/api/users/verification/{verificationType}/send-otp")
    public ResponseEntity<String> sendVerificationOtp(@RequestHeader("Authorization") String jwt , @PathVariable VerificationType verificationType) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        VerificationCode verificationCode = verificationCodeService.getVerificationCodeByUser(user.getId());

        if(verificationCode == null ){
           verificationCode =  verificationCodeService.sendVerificationCode(user , verificationType);
        }

        if(verificationType.equals(verificationType.EMAIL)){
            emailService.sendVerificationOtpEmail(user.getEmail() , verificationCode.getOtp());
        }


        return new ResponseEntity<>("verification otp sent successfully" , HttpStatus.OK);
    }

    @PatchMapping("/api/users/enable-two-factor/verify-otp/{otp}")
    public ResponseEntity<User> enableTwoFactorAuthentication(@PathVariable String otp ,@RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);

        VerificationCode verificationCode = verificationCodeService.getVerificationCodeByUser(user.getId());

        String sendTo = verificationCode.getVerificationType().equals(VerificationType.EMAIL)?verificationCode.getEmail():verificationCode.getMobile();

        boolean isVerified = verificationCode.getOtp().equals(otp);

        if(isVerified){
            User updatedUser = userService.enableTwoFactorAuthentication(verificationCode.getVerificationType(),sendTo,user);
            verificationCodeService.deleteVerificationCodeById(verificationCode);

            return new ResponseEntity<>(updatedUser , HttpStatus.OK);
        }

        throw new Exception("wrong otp");
    }



    @PostMapping("/auth/users/reset-password/send-otp")
    @Transactional
    public ResponseEntity<AuthResponse> sendForgotPasswordOtp(@RequestBody ForgotPasswordTokenRequest req) throws Exception {
        User user = userService.findUserByEmail(req.getSendTo());
        String otp = OtpUtils.generateOTP();
        UUID uuid = UUID.randomUUID();
        String id = uuid.toString();

        forgotPasswordService.deleteByUserId(user.getId());
        ForgotPasswordToken token = forgotPasswordService.createToken(user, id, otp, req.getVerificationType(), req.getSendTo());

        // Generate temporary reset token and include it in the JWT field
        String resetToken = Jwts.builder()
                .setSubject(user.getEmail())
                .claim("reset", true)
                .claim("sessionId", id)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 15 * 60 * 1000))
                .signWith(Keys.hmacShaKeyFor(JwtConstant.SECRETE_KEY.getBytes()))
                .compact();

        if(req.getVerificationType().equals(VerificationType.EMAIL)) {
            emailService.sendVerificationOtpEmail(user.getEmail(), token.getOtp());
        }

        AuthResponse response = new AuthResponse();
        response.setJwt(resetToken); // Using existing jwt field for reset token
        response.setSession(token.getId());
        response.setMessage("Password reset OTP sent successfully");
        response.setStatus(true);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PatchMapping("/auth/users/reset-password/verify-otp")
    public ResponseEntity<ApiResponse> resetPassword(
            @RequestParam String id,
            @RequestBody ResetPasswordRequest req,
            @RequestHeader("Authorization") String jwt,
            HttpServletRequest request) throws Exception {

        // Get attributes from the reset token
        String email = (String) request.getAttribute("resetTokenEmail");
        String sessionIdFromToken = (String) request.getAttribute("resetTokenSessionId");

        if (email == null || sessionIdFromToken == null || !sessionIdFromToken.equals(id)) {
            throw new Exception("Invalid reset token");
        }

        ForgotPasswordToken forgotPasswordToken = forgotPasswordService.findById(id);
        if (forgotPasswordToken == null) {
            throw new Exception("Invalid OTP session");
        }

        if (!forgotPasswordToken.getOtp().equals(req.getOtp())) {
            throw new Exception("Wrong OTP");
        }

        // Verify new password meets requirements (add your own validation)
        if (req.getPassword() == null || req.getPassword().length() < 8) {
            throw new Exception("Password must be at least 8 characters");
        }

        // Update password with encoding
        userService.updatePassword(forgotPasswordToken.getUser(), req.getPassword());

        // Delete the used token
        forgotPasswordService.deleteToken( forgotPasswordToken);

        return ResponseEntity.ok(new ApiResponse("Password updated successfully"));
    }


    @PatchMapping("/api/users/disable-two-factor/verify-otp/{otp}")
    public ResponseEntity<User> disableTwoFactorAuthentication(
            @PathVariable String otp,
            @RequestHeader("Authorization") String jwt) throws Exception {

        User user = userService.findUserProfileByJwt(jwt);

        // Verify the OTP
        VerificationCode verificationCode = verificationCodeService.getVerificationCodeByUser(user.getId());

        if (verificationCode == null || !verificationCode.getOtp().equals(otp)) {
            throw new Exception("Invalid verification code");
        }

        // Disable 2FA
        User updatedUser = userService.disableTwoFactorAuthentication(user);

        // Clean up the verification code
        verificationCodeService.deleteVerificationCodeById(verificationCode);

        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }





}
