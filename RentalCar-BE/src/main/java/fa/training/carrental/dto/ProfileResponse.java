package fa.training.carrental.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponse {
    private String fullName;
    private String dateOfBirth;
    private String address;
    private String phoneNo;
    private String email;
    private String drivingLicenseFile;
    private String drivingLicenseUrl;
    private String nationalIdNo;
    @NotNull
    private String role;
    private Integer cityCode;
    private Integer districtCode;
    private Integer wardCode;
}
