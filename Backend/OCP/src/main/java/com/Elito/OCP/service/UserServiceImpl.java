package com.Elito.OCP.service;

import com.Elito.OCP.config.JwtProvider;
import com.Elito.OCP.domain.VerificationType;
import com.Elito.OCP.model.TwoFactorAuth;
import com.Elito.OCP.model.User;
import com.Elito.OCP.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;


@RestController
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public User findUserProfileByJwt(String jwt) throws Exception {
        String email = JwtProvider.getEmailFromToken(jwt);
        User user = userRepository.findByEmail(email);

        if(user == null){
            throw new Exception("user not found");
        }
        return user;
    }

    @Override
    public User findUserByEmail(String email) throws Exception {
        User user = userRepository.findByEmail(email);

        if(user == null){
            throw new Exception("user not found");
        }
        return user;
    }

    @Override
    public User findUserById(Long userId) throws Exception {
        Optional<User> user = userRepository.findById(userId);
        if(user.isEmpty()){
            throw new Exception("user not found");
        }
        return user.get();
    }

    @Override
    public User enableTwoFactorAuthentication(VerificationType verificationType, String sendTo, User user) {
        TwoFactorAuth twoFactorAuth = new TwoFactorAuth();
        twoFactorAuth.setEnabled(true);
        twoFactorAuth.setSendTo(verificationType);

        user.setTwoFactorAuth(twoFactorAuth);

        return userRepository.save(user);
    }


    @Override
    public User updatePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }


    @Override
    public User disableTwoFactorAuthentication(User user) throws Exception {
        if (user.getTwoFactorAuth() == null || !user.getTwoFactorAuth().isEnabled()) {
            throw new Exception("Two-factor authentication is not enabled");
        }

        user.getTwoFactorAuth().setEnabled(false);
        user.getTwoFactorAuth().setSendTo(null);

        return userRepository.save(user);
    }
}
