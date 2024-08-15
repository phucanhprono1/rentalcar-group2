package fa.training.carrental.services;

import fa.training.carrental.dto.TransactionDTO;
import fa.training.carrental.entities.Account;
import fa.training.carrental.entities.CarOwner;
import fa.training.carrental.entities.Customer;
import fa.training.carrental.entities.Transaction;
import fa.training.carrental.enums.ERole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

public interface WalletService {
     Optional<Account> findByEmail(String email);
     Optional<Customer> findByCustomerEmail(String email);
     Optional<CarOwner> findByCarOwnerEmail(String email);
     BigDecimal topUp (BigDecimal money, String email);
     BigDecimal withdraw (BigDecimal money, String email);
     BigDecimal getWallet(String email);
     Page <TransactionDTO> getTransactionHistory (LocalDateTime fromDate, LocalDateTime toDate, String email, Pageable pageable);
     BigDecimal confirmDeposit(BigDecimal deposit, String email);
     BigDecimal confirmPayment(BigDecimal basePrice, String email, Long carId);
     BigDecimal getCurrentBalance(String email);

}
