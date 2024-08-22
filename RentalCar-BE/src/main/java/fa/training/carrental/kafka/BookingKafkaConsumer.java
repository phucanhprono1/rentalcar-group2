package fa.training.carrental.kafka;

import fa.training.carrental.dto.BookingCarResponse;
import fa.training.carrental.dto.bookingdto.BookingCarRequest;
import fa.training.carrental.services.BookingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

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
}