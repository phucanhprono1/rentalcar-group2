package fa.training.carrental.services.impl;

import fa.training.carrental.entities.RefreshToken;
import fa.training.carrental.repositories.AccountRepository;
import fa.training.carrental.repositories.RefreshTokenRepository;
import fa.training.carrental.services.RefreshTokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {
    @Autowired
    RefreshTokenRepository refreshTokenRepository;

    @Autowired
    AccountRepository accountRepository;

    public RefreshToken createRefreshToken(String email){
        RefreshToken refreshToken = RefreshToken.builder()
                .account(accountRepository.findByEmail(email).orElseThrow())
                .token(UUID.randomUUID().toString())
                .expiryDate(LocalDateTime.now().plus(1, ChronoUnit.YEARS))
                .build();
        return refreshTokenRepository.save(refreshToken);
    }



    public Optional<RefreshToken> findByToken(String token){
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken verifyExpiration(RefreshToken token){
        if(token.getExpiryDate().isBefore(LocalDateTime.now())){
            refreshTokenRepository.delete(token);
            throw new RuntimeException(token.getToken() + " Refresh token is expired. Please make a new login..!");
        }
        return token;
    }

    @Override
    public boolean deleteRefreshToken(String token) {
        try {
            refreshTokenRepository.deleteByToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }

    }
}
