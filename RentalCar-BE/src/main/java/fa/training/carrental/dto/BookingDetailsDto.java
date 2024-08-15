package fa.training.carrental.dto;

import fa.training.carrental.enums.BookingStatus;
import fa.training.carrental.enums.PaymentMethod;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class BookingDetailsDto {
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
    private Long customerId;
    private Long driverId;
    private PaymentMethod paymentMethod;
    private String customerName;
    @Email
    private String customerEmail;
    @Pattern(regexp = "^[0-9]{12}$")
    private String customerNationalIdNo;
    @Pattern(regexp = "^\\+\\d{11}$")
    private String customerPhone;
    private String customerDrivingLicense;
    private LocalDate customerDateOfBirth;
    private String customerAddress;
    private Integer customerWardCode;
    private Integer customerDistrictCode;
    private Integer customerCityCode;
    private String customerDriverName;
    @Email
    private String customerDriverEmail;
    @Pattern(regexp = "^[0-9]{12}$")
    private String customerDriverNationalIdNo;
    @Pattern(regexp = "^\\+\\d{11}$")
    private String customerDriverPhone;
    private LocalDate customerDriverDateOfBirth;
    private String customerDriverAddress;
    private String customerDriverDrivingLicense;
    private Integer customerDriverWardCode;
    private Integer customerDriverDistrictCode;
    private Integer customerDriverCityCode;
    private List<String> images;

    public BookingDetailsDto(String bookingNo, LocalDateTime startDateTime, LocalDateTime endDateTime,
                             Long carId, String carName, BigDecimal basePrice, BigDecimal deposit,
                             BookingStatus bookingStatus, BigDecimal total, Long customerId, Long driverId,
                             PaymentMethod paymentMethod, String customerName, String customerEmail,
                             String customerNationalIdNo, String customerPhone, LocalDate customerDateOfBirth,
                             String customerAddress, Integer customerWardCode, Integer customerDistrictCode,
                             Integer customerCityCode, String customerDriverName, String customerDriverEmail,
                             String customerDriverNationalIdNo, String customerDriverPhone,
                             LocalDate customerDriverDateOfBirth, String customerDriverAddress,
                             String customerDriverDrivingLicense, Integer customerDriverWardCode,
                             Integer customerDriverDistrictCode, Integer customerDriverCityCode,String customerDrivingLicense) {
        this.bookingNo = bookingNo;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.carId = carId;
        this.carName = carName;
        this.basePrice = basePrice;
        this.deposit = deposit;
        this.bookingStatus = bookingStatus;
        this.numberOfDays = getNumberOfDays();
        this.total = total;
        this.customerId = customerId;
        this.driverId = driverId;
        this.paymentMethod = paymentMethod;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerNationalIdNo = customerNationalIdNo;
        this.customerPhone = customerPhone;
        this.customerDateOfBirth = customerDateOfBirth;
        this.customerAddress = customerAddress;
        this.customerWardCode = customerWardCode;
        this.customerDistrictCode = customerDistrictCode;
        this.customerCityCode = customerCityCode;
        this.customerDriverName = customerDriverName;
        this.customerDriverEmail = customerDriverEmail;
        this.customerDriverNationalIdNo = customerDriverNationalIdNo;
        this.customerDriverPhone = customerDriverPhone;
        this.customerDriverDateOfBirth = customerDriverDateOfBirth;
        this.customerDriverAddress = customerDriverAddress;
        this.customerDriverDrivingLicense = customerDriverDrivingLicense;
        this.customerDriverWardCode = customerDriverWardCode;
        this.customerDriverDistrictCode = customerDriverDistrictCode;
        this.customerDriverCityCode = customerDriverCityCode;
        this.customerDrivingLicense = customerDrivingLicense;

    }
    public Long getNumberOfDays() {
        return ChronoUnit.DAYS.between(this.startDateTime.toLocalDate(), this.endDateTime.toLocalDate()) + 1;
    }


}
