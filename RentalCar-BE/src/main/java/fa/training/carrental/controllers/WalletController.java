package fa.training.carrental.controllers;

import fa.training.carrental.dto.MyCarDto;
import fa.training.carrental.dto.PaginatedResponse;
import fa.training.carrental.dto.TransactionDTO;
import fa.training.carrental.entities.Account;
import fa.training.carrental.entities.CarOwner;
import fa.training.carrental.entities.Customer;
import fa.training.carrental.entities.Transaction;
import fa.training.carrental.enums.ERole;
import fa.training.carrental.services.EmailService;
import fa.training.carrental.services.WalletService;
import io.micrometer.common.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment")
public class WalletController {
    private WalletService walletService;
    private EmailService emailService;
    

    @Autowired
    public WalletController(WalletService walletService, EmailService emailService) {
        this.walletService = walletService;
        this.emailService = emailService;
    }

    @GetMapping("/wallet")
    public ResponseEntity<?> getWallet(Authentication authentication) {
        String email = authentication.getName();
        Map<String, BigDecimal> balance = new HashMap<>();
        balance.put("balance", walletService.getWallet(email));
        return ResponseEntity.ok(balance);
    }

    @PutMapping("/top-up")
    public ResponseEntity<?> topUp(Authentication authentication, @RequestParam BigDecimal money) {
        if (Integer.parseInt(String.valueOf(money)) < 0) {
            return ResponseEntity.badRequest().body("Top up money cant be smaller than 0");
        }
        else if (Integer.parseInt(String.valueOf(money)) == 0) {
            return ResponseEntity.badRequest().body("Top up money cant be 0");
        }
        String email = authentication.getName();
        emailService.sendWalletChangeEmail(email, LocalDateTime.now());
        return ResponseEntity.ok(walletService.topUp(money, email));
    }

    @PutMapping("/withdraw")
    public ResponseEntity<?> withdraw(Authentication authentication, @RequestParam BigDecimal money) {
        String email = authentication.getName();
        Account account = walletService.findByEmail(email).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found for email: " + email)
        );

        if (Integer.parseInt(String.valueOf(money)) == 0) {
            return ResponseEntity.badRequest().body("Top up money cant be 0");
        }

        BigDecimal currentBalance = null; // Initialize balance variable

        if (account.getRole().equals(ERole.ROLE_CUSTOMER)) {
            Customer customer = walletService.findByCustomerEmail(email).orElseThrow(
                    () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found for email: " + email)
            );
            currentBalance = customer.getWallet();
        } else if (account.getRole().equals(ERole.ROLE_CAR_OWNER)) {
            CarOwner carOwner = walletService.findByCarOwnerEmail(email).orElseThrow(
                    () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car owner not found for email: " + email)
            );
            currentBalance = carOwner.getWallet();
        }

        if (currentBalance == null || currentBalance.compareTo(money) < 0) {
            return ResponseEntity.badRequest().body("Insufficient balance for withdrawal");
        }
        emailService.sendWalletChangeEmail(email, LocalDateTime.now());
        return ResponseEntity.ok(walletService.withdraw(money, email));
    }


    @GetMapping("/transaction-history")
    public ResponseEntity<PaginatedResponse<TransactionDTO>> viewHistory(Authentication authentication,
                                                                         @RequestParam(required = false) String fromDate,
                                                                         @RequestParam(required = false) String toDate,
                                                                         @RequestParam(defaultValue = "1") int page,
                                                                         @RequestParam(defaultValue = "10") int size
    ) {
        String email = authentication.getName();
        Pageable pageable = PageRequest.of(page - 1, size);
        LocalDateTime startDate;
        LocalDateTime endDate;
        PaginatedResponse<TransactionDTO> response = new PaginatedResponse<>();
        if (StringUtils.isBlank(fromDate) || StringUtils.isBlank(toDate)) {
            endDate = LocalDateTime.now();
            startDate = LocalDateTime.now().plusMonths(-1);
        } else {
            startDate = LocalDateTime.parse(fromDate);
            endDate = LocalDateTime.parse(toDate);
        }
        Page<TransactionDTO> pagingTransaction = walletService.getTransactionHistory(startDate, endDate, email, pageable);
        response.setContent(pagingTransaction.getContent());
        response.setTotalPages(pagingTransaction.getTotalPages());
        response.setTotalElements(pagingTransaction.getTotalElements());
        return ResponseEntity.ok(response);
    }


    @GetMapping("/currentBalance")
    public ResponseEntity<BigDecimal> getCurrentBalance(Authentication authentication){
        String email = authentication.getName();
        return ResponseEntity.ok(walletService.getCurrentBalance(email));
    }
}
