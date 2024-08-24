package fa.training.carrental.dto.bookingdto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Setter
@Getter
public class BookingKafkaMessage {
    // Getters and Setters
    private BookingCarRequest bookingCarRequest;
    @JsonIgnore
    private byte[] renterDriverLicense;  // Byte array for file data
    @JsonIgnore
    private byte[] renterDriverDriverLicense;

    // Default constructor needed for deserialization
    public BookingKafkaMessage() {
    }

    // Constructor with parameters for creating instances
    @JsonCreator
    public BookingKafkaMessage(
            @JsonProperty("bookingCarRequest") BookingCarRequest bookingCarRequest,
            @JsonProperty("renterDriverLicense") byte[] renterDriverLicense,
            @JsonProperty("renterDriverDriverLicense") byte[] renterDriverDriverLicense) {
        this.bookingCarRequest = bookingCarRequest;
        this.renterDriverLicense = renterDriverLicense;
        this.renterDriverDriverLicense = renterDriverDriverLicense;
    }

    // Constructor for when files are provided as MultipartFile
    public BookingKafkaMessage(BookingCarRequest bookingCarRequest, MultipartFile renterDriverLicense, MultipartFile renterDriverDriverLicense) throws IOException {
        this.bookingCarRequest = bookingCarRequest;

        // Only call getBytes() if the file is not null
        if (renterDriverLicense != null && !renterDriverLicense.isEmpty()) {
            this.renterDriverLicense = renterDriverLicense.getBytes();
        }

        if (renterDriverDriverLicense != null && !renterDriverDriverLicense.isEmpty()) {
            this.renterDriverDriverLicense = renterDriverDriverLicense.getBytes();
        }
    }

}
