package fa.training.carrental.dto.bookingdto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public class BookingKafkaMessage {
    private BookingCarRequest bookingCarRequest;
    @JsonIgnore
    private byte[] renterDriverLicense;  // Byte array for file data
    @JsonIgnore
    private byte[] renterDriverDriverLicense;

    // Constructor
    public BookingKafkaMessage(BookingCarRequest bookingCarRequest, MultipartFile renterDriverLicense, MultipartFile renterDriverDriverLicense) throws IOException {
        this.bookingCarRequest = bookingCarRequest;
        this.renterDriverLicense = renterDriverLicense.getBytes(); // Convert to byte array
        this.renterDriverDriverLicense = renterDriverDriverLicense.getBytes();
    }

    // Getters and Setters
    public BookingCarRequest getBookingCarRequest() {
        return bookingCarRequest;
    }

    public byte[] getRenterDriverLicense() {
        return renterDriverLicense;
    }

    public byte[] getRenterDriverDriverLicense() {
        return renterDriverDriverLicense;
    }
}