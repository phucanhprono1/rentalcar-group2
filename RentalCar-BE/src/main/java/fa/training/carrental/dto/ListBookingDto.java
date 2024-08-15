package fa.training.carrental.dto;

import fa.training.carrental.entities.Car;
import fa.training.carrental.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListBookingDto {
    private String bookingNo;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private Long numberOfDays;
    private BigDecimal total;
    private BigDecimal deposit;
    private Long carId;
    private String carName;
    private BigDecimal basePrice;
    private BookingStatus bookingStatus;
    private LocalDateTime lastModifiedDate;
    private List<String> images;

    public ListBookingDto(String bookingNo, LocalDateTime startDateTime, LocalDateTime endDateTime, Long carId, String carName, BigDecimal basePrice, BigDecimal deposit, BookingStatus bookingStatus, LocalDateTime lastModifiedDate,BigDecimal total) {
        this.bookingNo = bookingNo;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.carId = carId;
        this.carName = carName;
        this.basePrice = basePrice;
        this.deposit = deposit;
        this.bookingStatus = bookingStatus;
        this.lastModifiedDate = lastModifiedDate;
        this.numberOfDays = getNumberOfDays();
        this.total = total;
    }

    public Long getNumberOfDays() {
        return ChronoUnit.DAYS.between(this.startDateTime.toLocalDate(), this.endDateTime.toLocalDate()) + 1;
    }

}