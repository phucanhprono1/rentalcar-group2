package fa.training.carrental.controllers;

import fa.training.carrental.dto.BookingCarResponse;
import fa.training.carrental.dto.ListBookingDto;
import fa.training.carrental.dto.UpdateBookingStatusRequest;
import fa.training.carrental.dto.bookingdto.BookingCarRequest;
import fa.training.carrental.dto.bookingdto.BookingKafkaMessage;
import fa.training.carrental.dto.bookingdto.EditBookingDto;
import fa.training.carrental.entities.Booking;
import fa.training.carrental.entities.Car;
import fa.training.carrental.entities.Customer;
import fa.training.carrental.entities.Driver;
import fa.training.carrental.enums.BookingStatus;
import fa.training.carrental.enums.CarStatus;
import fa.training.carrental.repositories.BookingRepository;
import fa.training.carrental.repositories.CarRepository;
import fa.training.carrental.repositories.CustomerRepository;
import fa.training.carrental.services.BookingService;
import fa.training.carrental.services.CarService;
import fa.training.carrental.services.WalletService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.requestreply.ReplyingKafkaTemplate;
import org.springframework.kafka.requestreply.RequestReplyFuture;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/bookings")
@Slf4j
public class BookingController {
    private final BookingService bookingService;
    private final CustomerRepository customerRepository;
    private final BookingRepository bookingRepository;
    private final CarService carService;
    private final WalletService walletService;
    private final CarRepository carRepository;
    private final KafkaTemplate<String, BookingCarRequest> kafkaTemplate;
    private final ReplyingKafkaTemplate<String, BookingKafkaMessage, BookingCarResponse> replyingKafkaTemplate;
    Logger logger = LoggerFactory.getLogger(BookingController.class);
    @Autowired
    public BookingController(BookingService bookingService, CustomerRepository customerRepository, BookingRepository bookingRepository, CarService carService, WalletService walletService, CarRepository carRepository, KafkaTemplate<String, BookingCarRequest> kafkaTemplate, ReplyingKafkaTemplate<String, BookingKafkaMessage, BookingCarResponse> replyingKafkaTemplate) {
        this.bookingService = bookingService;
        this.customerRepository = customerRepository;
        this.bookingRepository = bookingRepository;
        this.carService = carService;
        this.walletService = walletService;
        this.carRepository = carRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.replyingKafkaTemplate = replyingKafkaTemplate;
    }

    @GetMapping("/view-all-by-current-customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> viewAllBookingsByCurrentCustomer(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "lastModifiedDate") String sortBy,
            @RequestParam(defaultValue = "desc") String order) {

        Customer customer = customerRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Cannot find customer with email: " + authentication.getName()));

        Sort.Direction direction = order.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<ListBookingDto> bookings = bookingService.getBookingsByCustomerId(customer.getId(), pageable);
        return ResponseEntity.ok(bookings);
    }
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping(value = "/book", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createBooking(Authentication authentication,
                                           @RequestPart(name = "customerDriverLicense", required = false) MultipartFile customerDriverLicense,
                                           @RequestPart(name = "customerDriverDriverLicense", required = false) MultipartFile customerDriverDriverLicense,
                                           @RequestPart(name = "bookingCarRequest") @Valid BookingCarRequest bookingCarRequest,
                                           BindingResult bindingResult)throws ExecutionException, InterruptedException {
        Map<String, String> errors = new HashMap<>();

        // Debugging Statements
        System.out.println("Content Type for customerDriverLicense: " + (customerDriverLicense != null ? customerDriverLicense.getContentType() : "No file"));
        System.out.println("Content Type for customerDriverDriverLicense: " + (customerDriverDriverLicense != null ? customerDriverDriverLicense.getContentType() : "No file"));
        System.out.println("Content Type for bookingCarRequest: " + bookingCarRequest);
        bookingCarRequest.setCustomerEmail(authentication.getName());
        // Check for binding result errors
        if (bindingResult.hasErrors()) {
            bindingResult.getAllErrors().forEach(error -> {
                String fieldName = ((FieldError) error).getField();
                String errorMessage = error.getDefaultMessage();
                errors.put(fieldName, errorMessage);
            });
        }

        // Check if hasDriver is true and validate customerDriverDriverLicense
//        if (bookingCarRequest.getHasDriver() && (customerDriverDriverLicense == null || customerDriverDriverLicense.isEmpty())) {
//            errors.put("customerDriverDriverLicense", "Customer driver license file is required when hasDriver is true");
//        }

        // Return errors if any are found
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }


        System.out.println(bookingCarRequest);
        BookingKafkaMessage bookingKafkaMessage = null;
        try {
            System.out.println("Creating BookingKafkaMessage");
            bookingKafkaMessage = new BookingKafkaMessage(bookingCarRequest, customerDriverLicense, customerDriverDriverLicense);

        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        // Send the message and receive the reply
        RequestReplyFuture<String, BookingKafkaMessage, BookingCarResponse> future =
                replyingKafkaTemplate.sendAndReceive(new ProducerRecord<>("bookings", bookingKafkaMessage));

        // Wait for the reply from the consumer
        ConsumerRecord<String, BookingCarResponse> response = future.get();

        // Return the response back to the client
        return new ResponseEntity<>(response.value(), HttpStatus.CREATED);
    }
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{bookingNo}")
    public ResponseEntity<?> viewBookingDetail(@PathVariable(value = "bookingNo") String bookingNo){
        Map<String,String> errors = new HashMap<>();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Customer customer = customerRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Cannot find customer with email: " + authentication.getName()));
        logger.info("Customer: " + customer.getEmail());
        logger.info("BookingNo: " + bookingNo);
        if(bookingNo == null){
            errors.put("bookingNo","Booking number is required");
            return ResponseEntity.badRequest().body(errors);
        }
        if(bookingRepository.findById(bookingNo).isEmpty()){
            errors.put("error","Booking not found");
            errors.put("code","404");
            errors.put("message","Booking not found");
            return new ResponseEntity<>(errors,HttpStatus.NOT_FOUND);
        }
        if(bookingService.getBookingDetails(customer.getId(),bookingNo) == null){
            errors.put("error","Booking not found");
            errors.put("code","404");
            errors.put("message","Booking not found with current customer");
            return new ResponseEntity<>(errors,HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(bookingService.getBookingDetails(customer.getId(),bookingNo),HttpStatus.OK);


    }
    @PreAuthorize("hasRole('CUSTOMER')")
    @PutMapping("/edit/{bookingNo}")
    public ResponseEntity<?> editBooking(@PathVariable(value = "bookingNo") String bookingNo,
                                         @RequestPart(name = "customerDriverLicense", required = false) MultipartFile customerDriverLicense,
                                         @RequestPart(name = "customerDriverDriverLicense", required = false) MultipartFile customerDriverDriverLicense,
                                         @RequestPart(name = "bookingCarRequest") @Valid EditBookingDto editBookingDto,
                                         BindingResult bindingResult){
        Map<String, String> errors = new HashMap<>();
        if (bindingResult.hasErrors()) {
            bindingResult.getAllErrors().forEach(error -> {
                String fieldName = ((FieldError) error).getField();
                String errorMessage = error.getDefaultMessage();
                errors.put(fieldName, errorMessage);
            });
        }
        if(bookingNo == null){
            errors.put("bookingNo","Booking number is required");
            return ResponseEntity.badRequest().body(errors);
        }
        if(bookingRepository.findById(bookingNo).isEmpty()){
            errors.put("error","Booking not found");
            errors.put("code","404");
            errors.put("message","Booking not found");
            return new ResponseEntity<>(errors,HttpStatus.NOT_FOUND);
        }
//        if(editBookingDto.getHasDriver() && (customerDriverDriverLicense == null || customerDriverDriverLicense.isEmpty())){
//            errors.put("customerDriverDriverLicense","Customer driver license file is required when hasDriver is true");
//        }
        return new ResponseEntity<>(bookingService.editBooking(editBookingDto,bookingNo,customerDriverLicense,customerDriverDriverLicense),HttpStatus.OK);
    }
    @PreAuthorize("hasRole('CUSTOMER')")
    @PutMapping("/cancel/{bookingNo}")
    public ResponseEntity<?> cancelBooking(Authentication authentication,@PathVariable(value = "bookingNo") String bookingNo) {
        Map<String, String> errors = new HashMap<>();
        if (bookingNo == null) {
            errors.put("bookingNo", "Booking number is required");
            return ResponseEntity.badRequest().body(errors);
        }
        if (bookingRepository.findById(bookingNo).isEmpty()) {
            errors.put("error", "Booking not found");
            errors.put("code", "404");
            errors.put("message", "Booking not found");
            return ResponseEntity.badRequest().body(errors);
        }

        BookingCarResponse bookingCarResponse = bookingService.cancelBooking(bookingNo, authentication.getName());
        if (bookingCarResponse.getBookingNo() != null) {
            return ResponseEntity.ok(bookingCarResponse);
        } else {
            return ResponseEntity.badRequest().body(bookingCarResponse);
        }
    }
    @PreAuthorize("hasRole('CUSTOMER')")
    @PutMapping("/confirm-pick-up/{bookingNo}")
    public ResponseEntity<?> confirmPickUp(Authentication authentication,@PathVariable(value = "bookingNo") String bookingNo) {
        Map<String, String> errors = new HashMap<>();
        if (bookingNo == null) {
            errors.put("bookingNo", "Booking number is required");
            return ResponseEntity.badRequest().body(errors);
        }
        if (bookingRepository.findById(bookingNo).isEmpty()) {
            errors.put("error", "Booking not found");
            errors.put("code", "404");
            errors.put("message", "Booking not found");
            return new ResponseEntity<>(errors, HttpStatus.NOT_FOUND);
        }
        if (!bookingRepository.findById(bookingNo).get().getCustomer().getEmail().equals(SecurityContextHolder.getContext().getAuthentication().getName())) {
            errors.put("error", "You are not allowed to confirm pick up this booking");
            errors.put("code", "403");
            errors.put("message", "You are not allowed to confirm pick up this booking");
            return new ResponseEntity<>(errors, HttpStatus.FORBIDDEN);
        }
        BookingCarResponse bookingCarResponse = bookingService.confirmPickUp(bookingNo,authentication.getName());
        if (bookingCarResponse.getBookingNo() != null) {
            return new ResponseEntity<>(bookingCarResponse, HttpStatus.OK);
        } else {
            return ResponseEntity.badRequest().body(bookingCarResponse);
        }
    }
    @Secured("ROLE_CUSTOMER")
    @PutMapping("/return-car/{bookingNo}")
    public ResponseEntity<?> confirmReturn(Authentication authentication,@PathVariable(value = "bookingNo") String bookingNo) {
        Map<String, String> errors = new HashMap<>();
        if (bookingNo == null) {
            errors.put("bookingNo", "Booking number is required");
            return ResponseEntity.badRequest().body(errors);
        }
        if (bookingRepository.findById(bookingNo).isEmpty()) {
            errors.put("error", "Booking not found");
            errors.put("code", "404");
            errors.put("message", "Booking not found");
            return ResponseEntity.badRequest().body(errors);
        }
        BookingCarResponse bookingCarResponse = bookingService.returnCar(bookingNo,authentication.getName());
        if (bookingCarResponse.getBookingNo() != null) {
            return new ResponseEntity<>(bookingCarResponse, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(bookingCarResponse, HttpStatus.BAD_REQUEST);
        }
    }
    // update booking status after owner confirm deposit or payment
    @Transactional
    @PatchMapping("/confirm/{carId}")
    public ResponseEntity<?> updateBookingStatus(@PathVariable("carId") Long id,
                                                 @RequestBody UpdateBookingStatusRequest bookingStatus,
                                                 Authentication authentication) {
        String email = authentication.getName();
        Car car = carRepository.findById(id).orElseThrow(() ->
                new RuntimeException("Can not found car has id: " + id));
        int affectedRows = bookingService.updateBookingStatus(id,
                Enum.valueOf(BookingStatus.class, bookingStatus.getCurrentStatus()),
                Enum.valueOf(BookingStatus.class, bookingStatus.getTargetStatus()));
        if ("COMPLETED".equals(bookingStatus.getTargetStatus())) {
            carService.updateCarStatus(id, CarStatus.AVAILABLE);
        } else if ("CONFIRMED".equals(bookingStatus.getTargetStatus())) {
            carService.updateCarStatus(id, CarStatus.BOOKED);
            walletService.confirmDeposit(car.getDeposit(), email);
        }
        return ResponseEntity.ok(affectedRows);
    }
}
