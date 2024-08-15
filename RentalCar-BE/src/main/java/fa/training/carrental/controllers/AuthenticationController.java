package fa.training.carrental.controllers;

import fa.training.carrental.dto.*;
import fa.training.carrental.entities.Account;
import fa.training.carrental.entities.RefreshToken;
import fa.training.carrental.repositories.AccountRepository;
import fa.training.carrental.repositories.PasswordTokenRepository;
import fa.training.carrental.services.AuthenticationService;
import fa.training.carrental.services.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
@Log4j2
@CrossOrigin
public class AuthenticationController {
    @Autowired
    private AuthenticationService service;
    @Autowired
    private AccountRepository accountRepository;
//    private final PasswordTokenRepository passwordTokenRepository;
//    @Qualifier("refreshTokenServiceImpl")
//    private final RefreshTokenService refreshTokenService;
    Logger logger = Logger.getLogger(AuthenticationController.class.getName());

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequestDto request, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            RegistrationResponse response = service.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.info("Registration failed: \n"+e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticate(@RequestBody @Valid AuthenticationRequest request, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            AuthenticationResponse response = service.authenticate(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.info("Authentication failed: "+e);
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/reset-password-request")
    public ResponseEntity<?> resetPassword(@RequestParam String email) {
        try {
            Map<String,String> response = new HashMap<>();
            Optional<Account> account = accountRepository.findByEmail(email);
            if (account.isEmpty()) {
                response.put("email", "Email not found");
                return ResponseEntity.badRequest().body(response);
            }
            else{
                boolean emailSent = service.sendResetPasswordEmail(account.get());
                if (!emailSent) {
                    response.put("email", "Email not sent");
                    return ResponseEntity.badRequest().body(response);
                }
                else {
                    response.put("email", "Email sent");
                    return ResponseEntity.ok(response);
                }
            }
        } catch (Exception e) {
            logger.info("Password reset request failed: "+ e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/reset-password-confirm")
    public ResponseEntity<?> resetPassword(@RequestBody @Valid PasswordResetRequest request, BindingResult bindingResult) {
        logger.info("Received password reset request: " + request);
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            boolean reset = service.resetPassword(request);
            Map<String,String> response = new HashMap<>();
            if (reset) {
                response.put("message", "Password reset successfully");
                return ResponseEntity.ok(response);
            }
            else {
                response.put("message", "Password reset failed");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            logger.info("Password reset failed: "+ e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody @Valid RefreshTokenRequest request, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (FieldError error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            AuthenticationResponse response = service.refreshToken(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.info("Token refresh failed: "+e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody RefreshTokenRequest refreshToken){
        try {
            return ResponseEntity.ok(service.logout(refreshToken));
        } catch (Exception e) {
            logger.info("Logout failed: "+e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

}
