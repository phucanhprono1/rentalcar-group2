package fa.training.carrental.kafka;

import fa.training.carrental.dto.BookingCarResponse;
import fa.training.carrental.dto.bookingdto.BookingCarRequest;
import fa.training.carrental.dto.bookingdto.BookingKafkaMessage;
import fa.training.carrental.services.BookingService;
import fa.training.carrental.utils.ByteArrayToMultipartFileConverter;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;

@Component
@Slf4j
public class BookingKafkaConsumer {

    private final BookingService bookingService;

    public BookingKafkaConsumer(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @KafkaListener(topics = "booking-requests", groupId = "booking-group")
    public void listen(BookingCarRequest bookingCarRequest) {
        log.info("Received booking request: " + bookingCarRequest);
        try {
            BookingCarResponse response = bookingService.bookCar(bookingCarRequest, null, null);
            // Handle the response (e.g., send confirmation email, update status)
            if (response.getBookingNo() != null) {
                log.info("Booking successful: " + response.getBookingNo());
                // TODO: Send confirmation to user (e.g., via email or WebSocket)
            } else {
                log.warn("Booking failed: " + response.getMessage());
                // TODO: Notify user about failure
            }
        } catch (Exception e) {
            log.error("Error processing booking request", e);
            // TODO: Handle error (e.g., retry logic, notify user)
        }
    }
    @KafkaListener(topics = "bookings", groupId = "bookingGroup")
    @SendTo("bookingReplies")
    @Transactional(rollbackOn = {Exception.class, Error.class, Throwable.class, RuntimeException.class})
    public BookingCarResponse processBooking(BookingKafkaMessage bookingKafkaMessage) {
        BookingCarRequest bookingCarRequest = bookingKafkaMessage.getBookingCarRequest();

        // Set the authentication context
        Authentication auth = new UsernamePasswordAuthenticationToken(bookingCarRequest.getCustomerEmail(), null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        // Rest of your code...
        MultipartFile renterDriverLicense = null;
        if(bookingKafkaMessage.getRenterDriverLicense() != null) {
            renterDriverLicense = new ByteArrayToMultipartFileConverter().convert(bookingKafkaMessage.getRenterDriverLicense(), "renterDriverLicense", "image/jpeg");
        }
        MultipartFile renterDriverDriverLicense = null;
        if(bookingKafkaMessage.getRenterDriverDriverLicense() != null) {
            renterDriverDriverLicense = new ByteArrayToMultipartFileConverter().convert(bookingKafkaMessage.getRenterDriverDriverLicense(), "renterDriverDriverLicense", "image/jpeg");
        }

        // Call your existing bookCar method to handle booking logic
        BookingCarResponse response = bookingService.bookCar(bookingCarRequest, renterDriverLicense, renterDriverDriverLicense);

        // Clear the authentication context
        SecurityContextHolder.clearContext();

        return response;
    }
}