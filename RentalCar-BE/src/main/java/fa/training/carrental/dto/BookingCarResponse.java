package fa.training.carrental.dto;

import fa.training.carrental.enums.TransactionType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingCarResponse {
    private Long carId;
    private String startDateTime;
    private String endDateTime;
    private String bookingNo;
    private String message;
    private Long driverId;
}
