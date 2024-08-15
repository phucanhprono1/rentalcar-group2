package fa.training.carrental.services;

import java.time.LocalDateTime;

public interface EmailService {
    void sendBookingConfirmationEmail(String carName, String customerEmail, Long carId, LocalDateTime bookedAt);
    void sendBookingCancellationEmail(String carName, String carOwnerEmail,LocalDateTime cancelledAt);
    void sendReturnCarEmail(String carName,Long carId, String carOwnerEmail, LocalDateTime returnedAt);
    void sendWalletChangeEmail(String userEmail, LocalDateTime changeAt);
}
