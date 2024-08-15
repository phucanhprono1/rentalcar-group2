package fa.training.carrental.services.impl;

import fa.training.carrental.config.security.JwtService;
import fa.training.carrental.dto.*;
import fa.training.carrental.entities.Account;
import fa.training.carrental.entities.PasswordResetToken;
import fa.training.carrental.entities.RefreshToken;
import fa.training.carrental.mapper.AuthenticationMapper;
import fa.training.carrental.repositories.AccountRepository;
import fa.training.carrental.repositories.PasswordTokenRepository;
import fa.training.carrental.services.AuthenticationService;
import fa.training.carrental.services.RefreshTokenService;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.logging.Logger;

@Service
public class AuthenticationServiceImpl implements AuthenticationService {
    private final AccountRepository accountRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuthenticationMapper authenticationMapper;
    private final PasswordTokenRepository passwordTokenRepository;
    private final JavaMailSender javaMailSender;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    @Value("${spring.mail.username}")
    private String fromEmail;
    @Value("${allowed-origins}")
    private String theAllowedOrigins;
    Logger logger = Logger.getLogger(AuthenticationServiceImpl.class.getName());
    @Autowired
    public AuthenticationServiceImpl(AccountRepository accountRepository, JwtService jwtService, AuthenticationManager authenticationManager, AuthenticationMapper authenticationMapper, PasswordTokenRepository passwordTokenRepository, JavaMailSender javaMailSender, PasswordEncoder passwordEncoder, RefreshTokenService refreshTokenService) {
        this.accountRepository = accountRepository;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.authenticationMapper = authenticationMapper;
        this.passwordTokenRepository = passwordTokenRepository;
        this.javaMailSender = javaMailSender;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional(rollbackOn = {Exception.class, Error.class, Throwable.class, RuntimeException.class})
    public RegistrationResponse register(RegisterRequestDto request) {
        try {
            Account account = authenticationMapper.toAccount(request);
            account = accountRepository.save(account);

            if (account.getCustomer() != null) {
                account.getCustomer().setAccount(account);
            } else if (account.getCarOwner() != null) {
                account.getCarOwner().setAccount(account);
            }

            return RegistrationResponse.builder()
                    .message("Registered successfully")
                    .build();
        } catch (DataAccessException e) {
            // Log the exception or handle it as necessary
            return RegistrationResponse.builder()
                    .message("Registration failed")
                    .build();
        }
    }

    @Override
    public LogoutResponse logout(RefreshTokenRequest request) {
        try{
            refreshTokenService.deleteRefreshToken(request.getRefreshToken());
            return LogoutResponse.builder()
                    .message("Logout successfully")
                    .build();
        }
        catch (Exception e){
            logger.info("Logout failed: "+e);
            return LogoutResponse.builder()
                    .message("Logout failed")
                    .build();
        }
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(account);
        var refreshToken = refreshTokenService.createRefreshToken(account.getEmail()).getToken();
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .role(account.getRole().name())
                .build();
    }
    @Transactional(rollbackOn = {Exception.class, Error.class, Throwable.class, RuntimeException.class})
    public String generateResetToken(Account account) {
        UUID uuid = UUID.randomUUID();
        LocalDateTime currentDateTime = LocalDateTime.now();
        LocalDateTime expiryDateTime = currentDateTime.plusHours(24);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setAccount(account);
        resetToken.setToken(uuid.toString());
        resetToken.setExpiryDateTime(expiryDateTime);
        passwordTokenRepository.save(resetToken);

        String endpointUrl = theAllowedOrigins+"/reset-password";
        return endpointUrl + "/" + resetToken.getToken();
    }
    @Transactional(rollbackOn = {Exception.class, Error.class, Throwable.class, RuntimeException.class})
    public boolean sendResetPasswordEmail(Account account) {
        try {
            passwordTokenRepository.deleteByAccount(account.getId());
            String resetLink = generateResetToken(account);
            String userEmail = account.getEmail();

            String htmlContent = "<!DOCTYPE html>"
                    + "<html lang=\"en\">"
                    + "<head>"
                    + "<meta charset=\"UTF-8\">"
                    + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
                    + "<title>Password Reset</title>"
                    + "<style>"
                    + "body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; color: #333; }"
                    + ".container { max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }"
                    + ".footer { margin-top: 20px; padding: 10px 0; text-align: center; border-top: 1px solid #ddd; font-size: 14px; color: #777; }"
                    + "</style>"
                    + "</head>"
                    + "<body>"
                    + "<p>We have just received a password reset request for <strong>" + userEmail + "</strong>.</p>"
                    + "<p>Please click <a href=\"" + resetLink + "\">here</a> to reset your password.</p>"
                    + "<p>For your security, the link will expire in 24 hours or immediately after you reset your password. </p>"
                    + "</body>"
                    + "</html>";

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(userEmail);
            helper.setSubject("Rent-a-car Password Reset");
            helper.setText(htmlContent, true);

            javaMailSender.send(message);

            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean hasExipred(LocalDateTime expiryDateTime) {
        LocalDateTime currentDateTime = LocalDateTime.now();
        return expiryDateTime.isAfter(currentDateTime);
    }

    @Override
    @Transactional(rollbackOn = {Exception.class, Error.class, Throwable.class, RuntimeException.class})
    public boolean resetPassword(PasswordResetRequest request) {
        PasswordResetToken token = passwordTokenRepository.findByToken(request.getToken());
        if (token != null && hasExipred(token.getExpiryDateTime()))  {
            Account account = token.getAccount();
            account.setPassword(passwordEncoder.encode(request.getNewPassword()));
            accountRepository.save(account);
            passwordTokenRepository.delete(token);
            return true;
        }
        return false;
    }

    @Override
    @Transactional(rollbackOn = {Exception.class, Error.class, Throwable.class, RuntimeException.class})
    public AuthenticationResponse refreshToken(RefreshTokenRequest request) {
        return refreshTokenService.findByToken(request.getRefreshToken())
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getAccount)
                .map(account -> {
                    var jwtToken = jwtService.generateToken(account);
                    return AuthenticationResponse.builder()
                            .token(jwtToken)
                            .refreshToken(request.getRefreshToken())
                            .role(account.getRole().name())
                            .build();
                }).orElseThrow(() ->new RuntimeException("Refresh Token is not in DB..!!"));
    }

}
