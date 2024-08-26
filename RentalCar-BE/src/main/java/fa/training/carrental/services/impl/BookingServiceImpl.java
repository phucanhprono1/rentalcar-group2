package fa.training.carrental.services.impl;

import fa.training.carrental.dto.*;
import fa.training.carrental.dto.bookingdto.AbstractBooking;
import fa.training.carrental.dto.bookingdto.BookingCarRequest;
import fa.training.carrental.dto.bookingdto.BookingKafkaMessage;
import fa.training.carrental.dto.bookingdto.EditBookingDto;
import fa.training.carrental.entities.*;
import fa.training.carrental.enums.BookingStatus;
import fa.training.carrental.enums.CarStatus;
import fa.training.carrental.enums.PaymentMethod;
import fa.training.carrental.enums.TransactionType;
import fa.training.carrental.exception.InvalidFileTypeException;
import fa.training.carrental.mapper.BookingMapper;
import fa.training.carrental.repositories.*;
import fa.training.carrental.services.BookingService;
import fa.training.carrental.services.CarService;
import fa.training.carrental.services.EmailService;
import fa.training.carrental.services.FileGatewayService;
import fa.training.carrental.utils.ByteArrayToMultipartFileConverter;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@Service
@Slf4j
public class BookingServiceImpl extends BaseServiceImpl<Booking, String> implements BookingService {

    private final BookingRepository bookingRepository;
    private final DriverRepository driverRepository;
    private final CarBookingRepository carBookingRepository;
    private final CustomerRepository customerRepository;
    private final CarOwnerRepository carOwnerRepository;
    private final CarRepository carRepository;
    private final BookingMapper bookingMapper;
    private final FileGatewayService fileGatewayService;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final EmailService emailService;
    private final CarService carService;
    private final CityProvinceRepository cityProvinceRepository;
    private final DistrictRepository districtRepository;
    private final WardRepository wardRepository;

    @Value("${spring.application.name}")
    private String fileUploadPath;
    @Value("${file.service.view-url}")
    private String fileViewUrl;

    public BookingServiceImpl(BookingRepository bookingRepository, DriverRepository driverRepository, CarBookingRepository carBookingRepository, CustomerRepository customerRepository, CarOwnerRepository carOwnerRepository, CarRepository carRepository, BookingMapper bookingMapper, FileGatewayService fileGatewayService, TransactionRepository transactionRepository, AccountRepository accountRepository, EmailService emailService, CarService carService, CityProvinceRepository cityProvinceRepository, DistrictRepository districtRepository, WardRepository wardRepository) {
        super(bookingRepository);
        this.bookingRepository = bookingRepository;
        this.driverRepository = driverRepository;
        this.carBookingRepository = carBookingRepository;
        this.customerRepository = customerRepository;
        this.carOwnerRepository = carOwnerRepository;
        this.carRepository = carRepository;
        this.bookingMapper = bookingMapper;
        this.fileGatewayService = fileGatewayService;
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.emailService = emailService;
        this.carService = carService;
        this.cityProvinceRepository = cityProvinceRepository;
        this.districtRepository = districtRepository;
        this.wardRepository = wardRepository;
    }
    Logger logger = Logger.getLogger(BookingServiceImpl.class.getName());
//    @KafkaListener(topics = "bookings", groupId = "bookingGroup")
//    @SendTo("bookingReplies")
//    @Transactional(rollbackOn = {Exception.class, Error.class, Throwable.class, RuntimeException.class})
//    public BookingCarResponse processBooking(BookingKafkaMessage bookingKafkaMessage) {
//        BookingCarRequest bookingCarRequest = bookingKafkaMessage.getBookingCarRequest();
//
//        // Set the authentication context
//        Authentication auth = new UsernamePasswordAuthenticationToken(bookingCarRequest.getCustomerEmail(), null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
//        SecurityContextHolder.getContext().setAuthentication(auth);
//
//        // Rest of your code...
//        MultipartFile renterDriverLicense = null;
//        if(bookingKafkaMessage.getRenterDriverLicense() != null) {
//            renterDriverLicense = new ByteArrayToMultipartFileConverter().convert(bookingKafkaMessage.getRenterDriverLicense(), "renterDriverLicense", "image/jpeg");
//        }
//        MultipartFile renterDriverDriverLicense = null;
//        if(bookingKafkaMessage.getRenterDriverDriverLicense() != null) {
//            renterDriverDriverLicense = new ByteArrayToMultipartFileConverter().convert(bookingKafkaMessage.getRenterDriverDriverLicense(), "renterDriverDriverLicense", "image/jpeg");
//        }
//
//        // Call your existing bookCar method to handle booking logic
//        BookingCarResponse response = bookCar(bookingCarRequest, renterDriverLicense, renterDriverDriverLicense);
//
//        // Clear the authentication context
//        SecurityContextHolder.clearContext();
//
//        return response;
//    }
    @Override
    public Page<ListBookingDto> getBookingsByCustomerId(Long customerId, Pageable pageable) {
        Page<ListBookingDto> bookings = bookingRepository.findByCustomerId(customerId, pageable);

        bookings.forEach(dto -> {
            List<String> images = carService.getCarImages(dto.getCarId());
            dto.setImages(images);
        });

        List<ListBookingDto> sortedBookings = bookings.getContent();

        return new PageImpl<>(sortedBookings, pageable, bookings.getTotalElements());
    }
    private void setCityProvinceDistrictWard(AbstractUser user, AbstractBooking request) {
        if (request.getCustomerCityCode() != null) {
            user.setCityProvince(cityProvinceRepository.findById(request.getCustomerCityCode()).orElse(null));
        }
        if (request.getCustomerDistrictCode() != null) {
            user.setDistrict(districtRepository.findById(request.getCustomerDistrictCode()).orElse(null));
        }
        if (request.getCustomerWardCode() != null) {
            user.setWard(wardRepository.findById(request.getCustomerWardCode()).orElse(null));
        }
    }
    private void updateCustomerInfo(AbstractUser customer, AbstractBooking bookingCarRequest, MultipartFile renterDriverLicense, Account account) {
        customer.setName(bookingCarRequest.getCustomerName() == null ? customer.getName() : bookingCarRequest.getCustomerName());
        customer.setPhoneNo(bookingCarRequest.getCustomerPhone() == null ? customer.getPhoneNo() : bookingCarRequest.getCustomerPhone());
        customer.setAddress(bookingCarRequest.getCustomerAddress() == null ? customer.getAddress() : bookingCarRequest.getCustomerAddress());
        customer.setNationalIdNo(bookingCarRequest.getCustomerNationalIdNo() == null ? customer.getNationalIdNo() : bookingCarRequest.getCustomerNationalIdNo());
        setCityProvinceDistrictWard(customer, bookingCarRequest);
        if (bookingCarRequest.getCustomerDateOfBirth() != null) {
            customer.setDateOfBirth(LocalDate.parse(bookingCarRequest.getCustomerDateOfBirth()));
        }
        if (renterDriverLicense != null) {
            String license = null;
            try {
                license = fileGatewayService.uploadImageFile(renterDriverLicense, fileUploadPath + "/drivingLicense/" + account.getId() + "/").getUrl();
            } catch (InvalidFileTypeException e) {
                logger.info("Error uploading driving license file: " + e.getMessage());
                throw new RuntimeException(e);
            }
            customer.setDrivingLicense(license);
        }
    }
    public Driver createDriver(AbstractBooking driverInfo, MultipartFile driverLicenseFile, String uploadPath) {
        CityProvince cityProvince = cityProvinceRepository.findById(driverInfo.getCustomerDriverCityCode())
                .orElseThrow(() -> new EntityNotFoundException("CityProvince not found"));
        District district = districtRepository.findById(driverInfo.getCustomerDriverDistrictCode())
                .orElseThrow(() -> new EntityNotFoundException("District not found"));

        Ward ward = wardRepository.findById(driverInfo.getCustomerDriverWardCode())
                .orElseThrow(() -> new EntityNotFoundException("Ward not found"));

        Driver driver = Driver.builder()
                .name(driverInfo.getCustomerDriverName())
                .email(driverInfo.getCustomerDriverEmail())
                .phoneNo(driverInfo.getCustomerDriverPhone())
                .address(driverInfo.getCustomerDriverAddress())
                .nationalIdNo(driverInfo.getCustomerDriverNationalIdNo())
                .dateOfBirth(LocalDate.parse(driverInfo.getCustomerDriverDateOfBirth()))
                .cityProvince(cityProvince)
                .district(district)
                .ward(ward)
                .build();
        driverRepository.save(driver);

        if (driverLicenseFile != null) {
            String driverLicense = null;
            try {
                driverLicense = fileGatewayService.uploadImageFile(driverLicenseFile, uploadPath + "/driverLicense/driver/" + driver.getId()).getUrl();
            } catch (InvalidFileTypeException e) {
                logger.info("Error uploading driver license file: " + e.getMessage());
                throw new RuntimeException(e);
            }
            driver.setDrivingLicense(driverLicense);
        }
        else{
            driver.setDrivingLicense(driverInfo.getCustomerDriverDrivingLicense());
        }

        return driver;
    }

    @Override
    @Transactional(rollbackOn = {Exception.class, Error.class, Throwable.class, RuntimeException.class})
    public BookingCarResponse bookCar(BookingCarRequest bookingCarRequest, MultipartFile renterDriverLicense, MultipartFile renterDriverDriverLicense) {
        Optional<Car> car = carRepository.findById(bookingCarRequest.getCarId());
        Optional<Customer> customer = customerRepository.findByEmail(bookingCarRequest.getCustomerEmail());
        Optional<Account> account = accountRepository.findByEmail(bookingCarRequest.getCustomerEmail());

        if (car.isPresent() && customer.isPresent()) {
            LocalDateTime startDateTime = LocalDateTime.parse(bookingCarRequest.getStartDateTime());
            LocalDateTime endDateTime = LocalDateTime.parse(bookingCarRequest.getEndDateTime());
            if (startDateTime.isAfter(endDateTime)) {
                return BookingCarResponse.builder()
                        .message("Start date time cannot be after end date time")
                        .build();
            }
            List<CarBooking> conflictingBookings = carBookingRepository.findConflictingBookings(car.get().getId(), startDateTime, endDateTime);
            if (!conflictingBookings.isEmpty()) {
                return BookingCarResponse.builder()
                        .message("Car is already booked for the requested time range")
                        .build();
            }
            if (customer.get().getWallet().compareTo(bookingCarRequest.getPaymentDeposit()) < 0 && bookingCarRequest.getPaymentMethod().equals(PaymentMethod.MY_WALLET.name())) {
                return BookingCarResponse.builder()
                        .message("Insufficient balance in wallet")
                        .build();
            }
            updateCustomerInfo(customer.get(), bookingCarRequest, renterDriverLicense, account.get());
            Booking booking = bookingMapper.toEntity(bookingCarRequest);
            booking.setCustomer(customer.get());
            bookingRepository.save(booking);
            CarBookingId carBookingId = CarBookingId.builder()
                    .bookingId(booking.getBookingNo())
                    .carId(car.get().getId())
                    .build();
            CarBooking carBooking = CarBooking.builder()
                    .id(carBookingId)
                    .booking(booking)
                    .car(car.get())
                    .build();
            carBookingRepository.save(carBooking);
            BookingCarResponse bookingCarResponse = bookingMapper.toResponse(bookingCarRequest);
            bookingCarResponse.setBookingNo(booking.getBookingNo());
            if (bookingCarRequest.getHasDriver()) {

                Driver driver = createDriver(bookingCarRequest, renterDriverDriverLicense, fileUploadPath);
                booking.setDriver(driver);
                bookingCarResponse.setDriverId(driver.getId());
            }

            bookingCarResponse.setBookingNo(booking.getBookingNo());
            car.get().setCarStatus(CarStatus.BOOKED);
            if (bookingCarRequest.getPaymentMethod().equals(PaymentMethod.CASH.name())) {
                booking.setPaymentMethod(PaymentMethod.CASH);
                booking.setBookingStatus(BookingStatus.PENDING_DEPOSIT);
            } else if (bookingCarRequest.getPaymentMethod().equals(PaymentMethod.BANK_TRANSFER.name())) {
                booking.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
                booking.setBookingStatus(BookingStatus.PENDING_DEPOSIT);
            } else if (bookingCarRequest.getPaymentMethod().equals(PaymentMethod.MY_WALLET.name())) {
                booking.setPaymentMethod(PaymentMethod.MY_WALLET);
                booking.setBookingStatus(BookingStatus.CONFIRMED);
                Transaction transactionCustomer = Transaction.builder()
                        .amount(bookingCarRequest.getPaymentDeposit().negate())
                        .transactionType(TransactionType.PAY_DEPOSIT)
                        .currentBalance(customer.get().getWallet().subtract(bookingCarRequest.getPaymentDeposit()))
                        .account(customer.get().getAccount())
                        .booking(booking)
                        .build();
                transactionRepository.save(transactionCustomer);
                Transaction transactionOwner = Transaction.builder()
                        .amount(bookingCarRequest.getPaymentDeposit())
                        .transactionType(TransactionType.RECEIVE_DEPOSIT)
                        .currentBalance(car.get().getOwner().getWallet().add(bookingCarRequest.getPaymentDeposit()))
                        .account(car.get().getOwner().getAccount())
                        .booking(booking)
                        .build();
                transactionRepository.save(transactionOwner);
                customer.get().setWallet(customer.get().getWallet().subtract(bookingCarRequest.getPaymentDeposit()));
                Optional<CarOwner> carOwnerOptional = carOwnerRepository.findById(car.get().getOwner().getId());
                carOwnerOptional.get().setWallet(carOwnerOptional.get().getWallet().add(bookingCarRequest.getPaymentDeposit()));
            }
            emailService.sendBookingConfirmationEmail(car.get().getName(), car.get().getOwner().getEmail(), car.get().getId(), LocalDateTime.now());
            return bookingCarResponse;
        }
        return BookingCarResponse.builder()
                .message("Booking failed")
                .build();
    }
    @Override
    public BookingDetailsDto getBookingDetails(Long customerId, String bookingId) {
        BookingDetailsDto bookingDetailsDto = bookingRepository.findByCustomerIdAndBookingNo(customerId, bookingId);
        logger.info("Booking details: " + bookingDetailsDto);
        if (bookingDetailsDto == null) {

            return null; // or throw a custom exception
        }
        bookingDetailsDto.setCustomerDrivingLicense(fileViewUrl+bookingDetailsDto.getCustomerDrivingLicense());
        List<String> images = carService.getCarImages(bookingDetailsDto.getCarId());
        Driver driver = bookingDetailsDto.getDriverId() != null ? driverRepository.findById(bookingDetailsDto.getDriverId()).orElse(null) : null;

        // Set driver details only if driver is not null
        if (driver != null) {
            bookingDetailsDto.setCustomerDriverDrivingLicense(fileViewUrl+driver.getDrivingLicense());
        }

        bookingDetailsDto.setImages(images);
        return bookingDetailsDto;
    }

    @Override
    @Transactional(rollbackOn = {Exception.class, Error.class, Throwable.class, RuntimeException.class})
    public BookingCarResponse editBooking(EditBookingDto editBookingDto, String bookingId, MultipartFile renterDriverLicense, MultipartFile renterDriverDriverLicense) {
        Optional<Booking> bookingOptional = bookingRepository.findById(bookingId);
        Optional<Customer> customerOptional = customerRepository.findByEmail(editBookingDto.getCustomerEmail());

        if (bookingOptional.isPresent() && customerOptional.isPresent() &&
                (bookingOptional.get().getBookingStatus().equals(BookingStatus.CONFIRMED) ||
                        bookingOptional.get().getBookingStatus().equals(BookingStatus.PENDING_DEPOSIT))) {

            Booking booking = bookingOptional.get();
            Customer customer = customerOptional.get();

            updateCustomerInfo(customer, editBookingDto, renterDriverLicense, customer.getAccount());

            if (editBookingDto.getHasDriver()) {
                Driver driver = booking.getDriver();
                if (driver == null) {
                    driver = new Driver();
                    updateDriverInfo(driver, editBookingDto, renterDriverDriverLicense);
                    driverRepository.save(driver);
                    booking.setDriver(driver);
                }

                updateDriverInfo(driver, editBookingDto, renterDriverDriverLicense);
                booking.setDriver(driver);
            } else {
                booking.setDriver(null);
            }

            bookingRepository.save(booking);

            return BookingCarResponse.builder()
                    .message("Booking updated successfully")
                    .bookingNo(booking.getBookingNo())
                    .carId(booking.getCarBookings().stream().map(CarBooking::getCar).toList().get(0).getId())
                    .driverId(booking.getDriver() != null ? booking.getDriver().getId() : null)
                    .startDateTime(booking.getStartDateTime().toString())
                    .endDateTime(booking.getEndDateTime().toString())
                    .build();
        }

        return BookingCarResponse.builder()
                .message("Booking update failed")
                .build();
    }

    private void updateDriverInfo(Driver driver, EditBookingDto editBookingDto, MultipartFile renterDriverDriverLicense) {
        driver.setName(editBookingDto.getCustomerDriverName());
        driver.setEmail(editBookingDto.getCustomerDriverEmail());
        driver.setPhoneNo(editBookingDto.getCustomerDriverPhone());
        driver.setAddress(editBookingDto.getCustomerDriverAddress());
        driver.setNationalIdNo(editBookingDto.getCustomerDriverNationalIdNo());
        driver.setDateOfBirth(LocalDate.parse(editBookingDto.getCustomerDriverDateOfBirth()));

        CityProvince cityProvince = cityProvinceRepository.findById(editBookingDto.getCustomerDriverCityCode())
                .orElseThrow(() -> new EntityNotFoundException("CityProvince not found"));
        District district = districtRepository.findById(editBookingDto.getCustomerDriverDistrictCode())
                .orElseThrow(() -> new EntityNotFoundException("District not found"));
        Ward ward = wardRepository.findById(editBookingDto.getCustomerDriverWardCode())
                .orElseThrow(() -> new EntityNotFoundException("Ward not found"));

        driver.setCityProvince(cityProvince);
        driver.setDistrict(district);
        driver.setWard(ward);

        if (renterDriverDriverLicense != null) {
            try {
                String driverLicense = fileGatewayService.uploadImageFile(renterDriverDriverLicense,
                        fileUploadPath + "/driverLicense/driver/" + driver.getId()).getUrl();
                driver.setDrivingLicense(driverLicense);
            } catch (InvalidFileTypeException e) {
                logger.info("Error uploading driver license file: " + e.getMessage());
                throw new RuntimeException(e);
            }
        }
    }

    //    Only allows customer to cancel booking if booking status is:
//            - Confirmed
//- Pending deposit
//- Stopped(No status named stopped in srs
//    If the booking is either In-progress, Completed or Pending payment -> Do not allow to cancel.
    @Override
    @Transactional(rollbackOn = {Exception.class, Error.class, Throwable.class, RuntimeException.class})
    public BookingCarResponse cancelBooking(String bookingId,String email) {
        Optional<Booking> booking = bookingRepository.findById(bookingId);
        if(!booking.get().getCustomer().getEmail().equals(email)){
            return BookingCarResponse.builder()
                    .message("You are not allowed to confirm pick up for this booking")
                    .build();
        }
        if (!booking.get().getBookingStatus().equals(BookingStatus.CANCELLED)){
            booking.get().setBookingStatus(BookingStatus.CANCELLED);

            for (Car car : booking.get().getCarBookings().stream().map(CarBooking::getCar).toList()) {
                car.setCarStatus(CarStatus.AVAILABLE);
                BigDecimal deposit = car.getDeposit();
                emailService.sendBookingCancellationEmail(car.getName(), car.getOwner().getEmail(), LocalDateTime.now());
                carRepository.save(car);
                Transaction transactionCustomer = Transaction.builder()
                        .amount(deposit)
                        .transactionType(TransactionType.REFUND_DEPOSIT)
                        .currentBalance(booking.get().getCustomer().getWallet().add(deposit))
                        .account(booking.get().getCustomer().getAccount())
                        .booking(booking.get())
                        .build();
                Customer customer = customerRepository.findById(booking.get().getCustomer().getId()).get();
                customer.setWallet(customer.getWallet().add(deposit));
                transactionRepository.save(transactionCustomer);
                Transaction transactionOwner = Transaction.builder()
                        .amount(deposit.negate())
                        .transactionType(TransactionType.REFUND_DEPOSIT)
                        .currentBalance(booking.get().getCustomer().getWallet().subtract(deposit))
                        .account(car.getOwner().getAccount())
                        .booking(booking.get())
                        .build();
                transactionRepository.save(transactionOwner);
                CarOwner carOwner = carOwnerRepository.findById(car.getOwner().getId()).get();
                carOwner.setWallet(carOwner.getWallet().subtract(deposit));
            }

            return BookingCarResponse.builder()
                    .message("Booking cancelled successfully")
                    .bookingNo(booking.get().getBookingNo())
                    .carId(booking.get().getCarBookings().stream().map(CarBooking::getCar).toList().get(0).getId())
                    .driverId(booking.get().getDriver() != null ? booking.get().getDriver().getId() : null)
                    .startDateTime(booking.get().getStartDateTime().toString())
                    .endDateTime(booking.get().getEndDateTime().toString())
                    .build();
        }
        return BookingCarResponse.builder()
                .message("Booking cancel failed as you can not cancel cancelled bookings")
                .build();
    }

    @Override
    @Transactional(rollbackOn = {Exception.class, Error.class, Throwable.class, RuntimeException.class})
    public BookingCarResponse confirmPickUp(String bookingId,String email) {
        Optional<Booking> booking = bookingRepository.findById(bookingId);
        if(!booking.get().getCustomer().getEmail().equals(email)){
            return BookingCarResponse.builder()
                    .message("You are not allowed to confirm pick up for this booking")
                    .build();
        }
        if (booking.isPresent() && booking.get().getBookingStatus().equals(BookingStatus.CONFIRMED)) {
            booking.get().setBookingStatus(BookingStatus.IN_PROGRESS);
            bookingRepository.save(booking.get());
            //set all car status in booking to booked
            for (Car car : booking.get().getCarBookings().stream().map(CarBooking::getCar).toList()) {
                car.setCarStatus(CarStatus.BOOKED);
                carRepository.save(car);
            }
            return BookingCarResponse.builder()
                    .message("Booking confirmed successfully")
                    .bookingNo(booking.get().getBookingNo())
                    .carId(booking.get().getCarBookings().stream().map(CarBooking::getCar).toList().get(0).getId())
                    .driverId(booking.get().getDriver() != null ? booking.get().getDriver().getId() : null)
                    .startDateTime(booking.get().getStartDateTime().toString())
                    .endDateTime(booking.get().getEndDateTime().toString())
                    .build();
        }
        return BookingCarResponse.builder()
                .message("Pick up confirmation failed as you can only confirm bookings to be pick up")
                .build();
    }

    @Scheduled(fixedRate = 30 * 60000) // Run every minute
    @Transactional
    @Override
    public void updateCarStatus() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> bookings = bookingRepository.findAllByStartDateTimeBefore(now);

        for (Booking booking : bookings) {
            for (CarBooking carBooking : booking.getCarBookings()) {
                Car car = carBooking.getCar();
                if (car.getCarStatus() != CarStatus.BOOKED && booking.getBookingStatus() == BookingStatus.CONFIRMED) {
                    car.setCarStatus(CarStatus.BOOKED);
                    carRepository.save(car);
                }
            }
        }
    }

    @Override
    @Transactional(rollbackOn = {Exception.class, Error.class, Throwable.class, RuntimeException.class})
    public BookingCarResponse returnCar(String bookingId, String email) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if(!bookingOpt.get().getCustomer().getEmail().equals(email)){
            return BookingCarResponse.builder()
                    .message("You are not allowed to confirm pick up for this booking")
                    .build();
        }
        if (!bookingOpt.get().getBookingStatus().equals(BookingStatus.IN_PROGRESS)) {
            return BookingCarResponse.builder()
                    .message("Return car failed as you can only return in-progress bookings")
                    .build();
        }

        Booking booking = bookingOpt.get();
        Customer customer = booking.getCustomer();
        BigDecimal walletBalance = customer.getWallet();

        BookingDetailsDto bookingDetails = bookingRepository.findByCustomerIdAndBookingNo(customer.getId(), booking.getBookingNo());
        BigDecimal total = bookingDetails.getTotal();
        BigDecimal deposit = bookingDetails.getDeposit();

        if (total.compareTo(deposit) > 0) {
            BigDecimal amountToDeduct = total.subtract(deposit);

            if (walletBalance.compareTo(amountToDeduct) < 0) {
                booking.setBookingStatus(BookingStatus.PENDING_PAYMENT);
//                booking.setEndDateTime(LocalDateTime.now());
                bookingRepository.save(booking);
                return BookingCarResponse.builder()
                        .message("Your wallet doesn’t have enough balance. Please top-up your wallet and try again")
                        .build();
            }

            createTransaction(customer, booking, amountToDeduct.negate(), TransactionType.OFFSET_FINAL_PAYMENT, walletBalance.subtract(amountToDeduct));
            customer.setWallet(walletBalance.subtract(amountToDeduct));

            for (Car car : booking.getCarBookings().stream().map(CarBooking::getCar).toList()) {
                CarOwner carOwner = car.getOwner();
                BigDecimal ownerBalance = carOwner.getWallet();
                createTransactionForOwner(carOwner, booking, amountToDeduct, TransactionType.OFFSET_FINAL_PAYMENT, ownerBalance.add(amountToDeduct));
                carOwner.setWallet(ownerBalance.add(amountToDeduct));
                emailService.sendReturnCarEmail(car.getName(), car.getId(), carOwner.getEmail(), LocalDateTime.now());
                car.setCarStatus(CarStatus.AVAILABLE);
                carRepository.save(car);
            }
        } else if (total.compareTo(deposit) < 0) {
            BigDecimal amountToRefund = deposit.subtract(total);
            createTransaction(customer, booking, amountToRefund, TransactionType.OFFSET_FINAL_PAYMENT, walletBalance.add(amountToRefund));
            customer.setWallet(walletBalance.add(amountToRefund));

            for (Car car : booking.getCarBookings().stream().map(CarBooking::getCar).toList()) {
                CarOwner carOwner = carOwnerRepository.findById(car.getOwner().getId()).get();
                BigDecimal ownerBalance = carOwner.getWallet();
                createTransactionForOwner(carOwner, booking, amountToRefund.negate(), TransactionType.OFFSET_FINAL_PAYMENT, ownerBalance.subtract(amountToRefund));
                emailService.sendReturnCarEmail(car.getName(), car.getId(), carOwner.getEmail(), LocalDateTime.now());
                carOwner.setWallet(ownerBalance.subtract(amountToRefund));
                car.setCarStatus(CarStatus.AVAILABLE);
                carRepository.save(car);
            }
        }
        else {
            for (Car car : booking.getCarBookings().stream().map(CarBooking::getCar).toList()) {
                CarOwner carOwner = carOwnerRepository.findById(car.getOwner().getId()).get();
                emailService.sendReturnCarEmail(car.getName(), car.getId(), carOwner.getEmail(), LocalDateTime.now());
                car.setCarStatus(CarStatus.AVAILABLE);
                carRepository.save(car);
            }
        }
        booking.setBookingStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);

        return BookingCarResponse.builder()
                .message("Car returned successfully")
                .bookingNo(booking.getBookingNo())
                .carId(booking.getCarBookings().stream().map(CarBooking::getCar).toList().get(0).getId())
                .driverId(booking.getDriver() != null ? booking.getDriver().getId() : null)
                .startDateTime(booking.getStartDateTime().toString())
                .endDateTime(booking.getEndDateTime().toString())
                .build();
    }

    private void createTransaction(Customer customer, Booking booking, BigDecimal amount, TransactionType transactionType, BigDecimal newBalance) {
        Transaction transaction = Transaction.builder()
                .amount(amount)
                .transactionType(transactionType)
                .currentBalance(newBalance)
                .account(customer.getAccount())
                .booking(booking)
                .build();
        transactionRepository.save(transaction);
    }

    private void createTransactionForOwner(CarOwner carOwner, Booking booking, BigDecimal amount, TransactionType transactionType, BigDecimal newBalance) {
        Transaction transaction = Transaction.builder()
                .amount(amount)
                .transactionType(transactionType)
                .currentBalance(newBalance)
                .account(carOwner.getAccount())
                .booking(booking)
                .build();
        transactionRepository.save(transaction);
    }

    @Override
    public int updateBookingStatus(Long carId, BookingStatus currentStatus, BookingStatus targetStatus) {
        return bookingRepository.updateBookingStatus(carId, currentStatus, targetStatus);
    }
}
