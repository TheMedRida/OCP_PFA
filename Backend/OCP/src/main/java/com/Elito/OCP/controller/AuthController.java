package com.Elito.OCP.controller;

import com.Elito.OCP.config.JwtProvider;
import com.Elito.OCP.domain.USER_ROLE;
import com.Elito.OCP.model.TwoFactorOTP;
import com.Elito.OCP.model.User;
import com.Elito.OCP.repository.UserRepository;
import com.Elito.OCP.response.ApiResponse;
import com.Elito.OCP.response.AuthResponse;
import com.Elito.OCP.service.CustomUserDetailsService;
import com.Elito.OCP.service.EmailService;
import com.Elito.OCP.service.TwoFactorOtpService;
import com.Elito.OCP.utils.OtpUtils;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private TwoFactorOtpService twoFactorOtpService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> register(@RequestBody User user) throws Exception {
        // Validate email uniqueness
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new Exception("Email is already registered");
        }

        // Create new user
        User newUser = new User();
        newUser.setFullName(user.getFullName());
        newUser.setEmail(user.getEmail());
        newUser.setPassword(passwordEncoder.encode(user.getPassword())); // Encode password
        newUser.setRole(user.getRole() != null ? user.getRole() : USER_ROLE.USER);

        User savedUser = userRepository.save(newUser);

        // Authenticate the user
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(savedUser.getEmail());
        Authentication auth = new UsernamePasswordAuthenticationToken(
                userDetails,
                user.getPassword(),
                userDetails.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        // Generate JWT
        String jwt = JwtProvider.generateToken(auth);

        // Build response
        AuthResponse res = new AuthResponse();
        res.setJwt(jwt);
        res.setStatus(true);
        res.setMessage("Registration successful");
        res.setRole(savedUser.getRole().name());

        return new ResponseEntity<>(res, HttpStatus.CREATED);
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> login(@RequestBody User loginRequest) throws Exception {
        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        // Authenticate
        Authentication auth = authenticate(email, password);
        SecurityContextHolder.getContext().setAuthentication(auth);

        // Get authenticated user
        User user = (User) auth.getPrincipal();

        // Generate JWT
        String jwt = JwtProvider.generateToken(auth);

        // Handle 2FA if enabled
        if (user.getTwoFactorAuth().isEnabled()) {
            return handleTwoFactorAuth(user, jwt);
        }

        // Build success response
        AuthResponse res = buildAuthResponse(user, jwt, "Login successful");
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @PostMapping("/two-factor/otp/{otp}")
    public ResponseEntity<AuthResponse> verifySigninOtp(
            @PathVariable String otp,
            @RequestParam String sessionId) throws Exception {

        TwoFactorOTP twoFactorOTP = twoFactorOtpService.findById(sessionId);
        if (twoFactorOTP == null) {
            throw new Exception("Invalid OTP session");
        }

        if (!twoFactorOtpService.verifyTwoFactorOtp(twoFactorOTP, otp)) {
            throw new Exception("Invalid OTP");
        }

        User user = twoFactorOTP.getUser();
        if (user == null) {
            throw new Exception("User not found");
        }

        AuthResponse res = buildAuthResponse(
                user,
                twoFactorOTP.getJwt(),
                "Two-factor authentication verified"
        );
        res.setTwoFactorAuthEnabled(true);

        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @PostMapping("/two-factor/resend-otp")
    public ResponseEntity<ApiResponse> resendTwoFactorOtp(
            @RequestParam String sessionId) throws Exception {

        TwoFactorOTP existingOTP = twoFactorOtpService.findById(sessionId);
        if (existingOTP == null) {
            throw new Exception("Invalid session");
        }

        User user = existingOTP.getUser();
        String newOtp = OtpUtils.generateOTP();

        existingOTP.setOtp(newOtp);
        twoFactorOtpService.updateTwoFactorOtp(existingOTP);

        emailService.sendVerificationOtpEmail(user.getEmail(), newOtp);

        return ResponseEntity.ok(
                new ApiResponse("New OTP sent successfully")
        );
    }

    // Helper Methods
    private Authentication authenticate(String email, String password) {
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);

        if (userDetails == null) {
            throw new BadCredentialsException("Invalid username");
        }

        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }

        return new UsernamePasswordAuthenticationToken(
                userDetails,
                password,
                userDetails.getAuthorities()
        );
    }

    private ResponseEntity<AuthResponse> handleTwoFactorAuth(User user, String jwt) throws MessagingException {
        String otp = OtpUtils.generateOTP();

        // Clear any existing OTP
        twoFactorOtpService.deleteByUserId(user.getId());

        // Create new OTP record
        TwoFactorOTP newOTP = twoFactorOtpService.createTwoFactorOtp(user, otp, jwt);
        emailService.sendVerificationOtpEmail(user.getEmail(), otp);

        AuthResponse res = new AuthResponse();
        res.setMessage("Two-factor authentication required");
        res.setTwoFactorAuthEnabled(true);
        res.setRole(user.getRole().name());
        res.setSession(newOTP.getId());

        return new ResponseEntity<>(res, HttpStatus.ACCEPTED);
    }

    private AuthResponse buildAuthResponse(User user, String jwt, String message) {
        AuthResponse res = new AuthResponse();
        res.setJwt(jwt);
        res.setStatus(true);
        res.setMessage(message);
        res.setRole(user.getRole().name());
        return res;
    }
}