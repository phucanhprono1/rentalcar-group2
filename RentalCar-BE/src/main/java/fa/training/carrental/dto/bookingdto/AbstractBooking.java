package fa.training.carrental.dto.bookingdto;

import fa.training.carrental.validations.ValidDriverDetails;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@ValidDriverDetails
public abstract class AbstractBooking {
    private String customerName;
    @Email
    private String customerEmail;
    @Pattern(regexp = "^[0-9]{12}$")
    private String customerNationalIdNo;
    private String customerDateOfBirth;
    @Pattern(regexp = "^\\+\\d{11}$")
    private String customerPhone;
    private String customerAddress;
    private String customerDrivingLicense;
    private Integer customerWardCode;
    private Integer customerDistrictCode;
    private Integer customerCityCode;
    @NotNull
    private Boolean hasDriver;
    private String customerDriverName;
    @Email
    private String customerDriverEmail;
    @Pattern(regexp = "^[0-9]{12}$")
    private String customerDriverNationalIdNo;
    @Pattern(regexp = "^\\+\\d{11}$")
    private String customerDriverPhone;
    private String customerDriverDateOfBirth;
    private String customerDriverAddress;
    private String customerDriverDrivingLicense;
    private Integer customerDriverWardCode;
    private Integer customerDriverDistrictCode;
    private Integer customerDriverCityCode;
}
