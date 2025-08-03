package com.Elito.OCP.service;

import com.Elito.OCP.model.TwoFactorOTP;
import com.Elito.OCP.model.User;
import com.Elito.OCP.repository.TwoFactorOtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class TwoFactorOtpServiceImpl implements TwoFactorOtpService {

    @Autowired
    private TwoFactorOtpRepository twoFactorOtpRepository;

    @Override
    public TwoFactorOTP createTwoFactorOtp(User user, String otp, String jwt) {
        UUID uuid = UUID.randomUUID();
        String id = uuid.toString();

        TwoFactorOTP twoFactorOTP = new TwoFactorOTP();
        twoFactorOTP.setOtp(otp);
        twoFactorOTP.setJwt(jwt);
        twoFactorOTP.setId(id);
        twoFactorOTP.setUser(user);

        return twoFactorOtpRepository.save(twoFactorOTP);
    }

    @Override
    public TwoFactorOTP findByUser(Long userId) {
        return twoFactorOtpRepository.findByUserId(userId);
    }

    @Override
    public TwoFactorOTP findById(String id) {
        Optional<TwoFactorOTP> otp = twoFactorOtpRepository.findById(id);
        return otp.orElse(null);
    }

    @Override
    public boolean verifyTwoFactorOtp(TwoFactorOTP twoFactorOTP, String otp) {
        return twoFactorOTP != null && twoFactorOTP.getOtp().equals(otp);
    }

    @Override
    @Transactional
    public void deleteTwoFactorOtp(TwoFactorOTP twoFactorOTP) {
        if (twoFactorOTP != null) {
            twoFactorOtpRepository.delete(twoFactorOTP);
        }
    }

    @Override
    @Transactional
    public void deleteByUserId(Long userId) {
        TwoFactorOTP otp = findByUser(userId);
        if (otp != null) {
            twoFactorOtpRepository.delete(otp);
        }
    }

    @Override
    public TwoFactorOTP updateTwoFactorOtp(TwoFactorOTP twoFactorOTP) {
        if (twoFactorOTP == null) {
            return null;
        }
        return twoFactorOtpRepository.save(twoFactorOTP);
    }
}