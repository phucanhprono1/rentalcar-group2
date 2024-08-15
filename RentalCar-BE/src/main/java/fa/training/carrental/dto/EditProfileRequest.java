package fa.training.carrental.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class EditProfileRequest {
    private String fullName;
    private String dateOfBirth;
    private String address;
    private String phoneNo;
    private String email;
    private String drivingLicense;
    private String nationalIdNo;
    @NotNull
    private String role;
    private Integer cityCode;
    private Integer districtCode;
    private Integer wardCode;
}
