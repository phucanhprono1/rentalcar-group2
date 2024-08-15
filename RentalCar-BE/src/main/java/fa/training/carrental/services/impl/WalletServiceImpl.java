package fa.training.carrental.services.impl;

import fa.training.carrental.controllers.AuthenticationController;
import fa.training.carrental.dto.TransactionDTO;
import fa.training.carrental.entities.Account;
import fa.training.carrental.entities.CarOwner;
import fa.training.carrental.entities.Customer;
import fa.training.carrental.entities.Transaction;
import fa.training.carrental.enums.ERole;
import fa.training.carrental.enums.TransactionType;
import fa.training.carrental.repositories.*;
import fa.training.carrental.services.WalletService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Transactional
public class WalletServiceImpl implements WalletService {

    private final BookingRepository bookingRepository;
    private AccountRepository accountRepository;
    private CustomerRepository customerRepository;
    private CarOwnerRepository carOwnerRepository;
    private TransactionRepository transactionRepository;

    @Autowired
    public WalletServiceImpl(AccountRepository accountRepository,
                             CustomerRepository customerRepository,
                             CarOwnerRepository carOwnerRepository,
                             TransactionRepository transactionRepository, BookingRepository bookingRepository) {
        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
        this.carOwnerRepository = carOwnerRepository;
        this.transactionRepository = transactionRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    public Optional<Account> findByEmail(String email) {
        return accountRepository.findByEmail(email);
    }

    @Override
    public Optional<Customer> findByCustomerEmail(String email) {
        return customerRepository.findByEmail(email);
    }
    @Override
    public Optional<CarOwner> findByCarOwnerEmail(String email) {
        return carOwnerRepository.findByEmail(email);
    }

    @Override
    @Transactional
    public BigDecimal topUp(BigDecimal money, String email) {
        Account account = accountRepository.findByEmail(email).orElseThrow(()
                -> new UsernameNotFoundException("Can not find user with the email: " + email));

        if (account.getRole().equals(ERole.ROLE_CUSTOMER)) {
            Customer customer = customerRepository.findByEmail(email).orElseThrow(()
                    -> new UsernameNotFoundException("Can not find customer with email: " + email));
            customer.setWallet(customer.getWallet().add(money));
            Transaction transaction = Transaction.builder().
                    amount(money).transactionType(TransactionType.TOP_UP).
                    createdDate(LocalDateTime.now()).
                    account(account).
                    build();
            transaction.setCurrentBalance(customer.getWallet());
            customerRepository.save(customer);
            transactionRepository.save(transaction);
            return money;
        } else if (account.getRole().equals(ERole.ROLE_CAR_OWNER)) {
            CarOwner carOwner = carOwnerRepository.findByEmail(email).orElseThrow(()
                    -> new UsernameNotFoundException("Can not find car owner with email: " + email));
            carOwner.setWallet(carOwner.getWallet().add(money));
            Transaction transaction = Transaction.builder().
                    amount(money).transactionType(TransactionType.TOP_UP).
                    createdDate(LocalDateTime.now()).
                    account(account).
                    build();

            transaction.setCurrentBalance(carOwner.getWallet());
            carOwnerRepository.save(carOwner);
            transactionRepository.save(transaction);
            return money;
        } else {
            throw new RuntimeException("Account not fount with email: " + email);
        }

    }

    @Override
    @Transactional
    public BigDecimal withdraw(BigDecimal money, String email) {
        Account account = accountRepository.findByEmail(email).orElseThrow(()
                -> new UsernameNotFoundException("Can not find user with the email: " + email));
        if (account.getRole().equals(ERole.ROLE_CUSTOMER)) {
            Customer customer = customerRepository.findByEmail(email).orElseThrow(()
                    -> new UsernameNotFoundException("Can not find customer with email: " + email));
            customer.setWallet(customer.getWallet().subtract(money));
            Transaction transaction = Transaction.builder().
                    amount(money.negate()).transactionType(TransactionType.WITHDRAW).
                    createdDate(LocalDateTime.now()).
                    account(account).
                    build();
            transaction.setCurrentBalance(customer.getWallet());
            customerRepository.save(customer);
            transactionRepository.save(transaction);
            return money;
        } else if (account.getRole().equals(ERole.ROLE_CAR_OWNER)) {
            CarOwner carOwner = carOwnerRepository.findByEmail(email).orElseThrow(()
                    -> new UsernameNotFoundException("Can not find car owner with email: " + email));
            carOwner.setWallet(carOwner.getWallet().subtract(money));
            Transaction transaction = Transaction.builder().
                    amount(money.negate()).transactionType(TransactionType.WITHDRAW).
                    createdDate(LocalDateTime.now()).
                    account(account).
                    build();
            transaction.setCurrentBalance(carOwner.getWallet());
            carOwnerRepository.save(carOwner);
            transactionRepository.save(transaction);
            return money;
        } else {
            throw new RuntimeException("Account not fount with email: " + email);
        }
    }

    @Override
    public BigDecimal getWallet(String email) {
        Account account = accountRepository.findByEmail(email).orElseThrow(()
                -> new UsernameNotFoundException("Can not find user with the email: " + email));
        if (account.getRole().equals(ERole.ROLE_CUSTOMER)) {
            Customer customer = customerRepository.findByEmail(email).orElseThrow(()
                    -> new UsernameNotFoundException("Can not find customer with email: " + email));
            return customer.getWallet();
        } else if (account.getRole().equals(ERole.ROLE_CAR_OWNER)) {
            CarOwner carOwner = carOwnerRepository.findByEmail(email).orElseThrow(()
                    -> new UsernameNotFoundException("Can not find car owner with email: " + email));
            return carOwner.getWallet();
        } else {
            throw new RuntimeException("Account not fount with email: " + email);
        }
    }

    @Override
    public BigDecimal confirmDeposit(BigDecimal deposit, String email) {
        Account account = accountRepository.findByEmail(email).orElseThrow(() ->
                new UsernameNotFoundException("Can not find account with email: " + email)
        );
        CarOwner carOwner = carOwnerRepository.findByEmail(email).orElseThrow(() ->
                new UsernameNotFoundException("Can not find car owner with email: " + email));
        carOwner.setWallet(carOwner.getWallet().add(deposit));
        Transaction transaction = Transaction.builder()
                .amount(deposit)
                .transactionType(TransactionType.RECEIVE_DEPOSIT)
                .createdDate(LocalDateTime.now())
                .account(account)
                .currentBalance(carOwner.getWallet())
                .build();
        carOwnerRepository.save(carOwner);
        transactionRepository.save(transaction);
        return deposit;
    }

    @Override
    public BigDecimal confirmPayment(BigDecimal basePrice, String email, Long carId) {
        Account account = accountRepository.findByEmail(email).orElseThrow(() ->
                new UsernameNotFoundException("Can not find account with email: " + email)
        );
        CarOwner carOwner = carOwnerRepository.findByEmail(email).orElseThrow(() ->
                new UsernameNotFoundException("Can not find car owner with email: " + email));

        var list = bookingRepository.calculateRentingDays(carId);
        System.out.println(list.size());
        BigDecimal numberOfRentingDays = BigDecimal.valueOf(list.isEmpty() ? 0 : list.get(0)).add(BigDecimal.valueOf(1));

        carOwner.setWallet(carOwner.getWallet().add(basePrice.multiply(numberOfRentingDays)));

        Transaction transaction = Transaction.builder()
                .amount(basePrice.multiply(numberOfRentingDays))
                .transactionType(TransactionType.OFFSET_FINAL_PAYMENT)
                .createdDate(LocalDateTime.now())
                .account(account)
                .currentBalance(carOwner.getWallet())
                .build();
        carOwnerRepository.save(carOwner);
        transactionRepository.save(transaction);
        return basePrice.multiply(numberOfRentingDays);
    }

    @Override
    public BigDecimal getCurrentBalance(String email) {
        return customerRepository.findByEmail(email)
                .map(Customer::getWallet)
                .orElse(BigDecimal.ZERO);
    }

    @Override
    public Page<TransactionDTO> getTransactionHistory(LocalDateTime fromDate, LocalDateTime toDate, String email, Pageable pageable) {
        Account account = accountRepository.findByEmail(email).orElseThrow(()
                -> new UsernameNotFoundException("Can not find user with the email: " + email));
       return transactionRepository.getByAccountId(fromDate, toDate,account.getId(), pageable);
    }
}
