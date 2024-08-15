package fa.training.carrental.services;

import fa.training.carrental.dto.*;
import fa.training.carrental.entities.Account;
import fa.training.carrental.entities.PasswordResetToken;
import fa.training.carrental.entities.RefreshToken;
import fa.training.carrental.mapper.AuthenticationMapper;
import fa.training.carrental.repositories.AccountRepository;

import fa.training.carrental.config.security.JwtService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;


public interface AuthenticationService {
    RegistrationResponse register(RegisterRequestDto request);
    LogoutResponse logout(RefreshTokenRequest request);
    AuthenticationResponse authenticate(AuthenticationRequest request);
    String generateResetToken(Account account);
    boolean sendResetPasswordEmail(Account account);
    boolean hasExipred(LocalDateTime expiryDateTime);
    boolean resetPassword(PasswordResetRequest request);
    AuthenticationResponse refreshToken(RefreshTokenRequest request);
}

