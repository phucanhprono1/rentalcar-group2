package fa.training.carrental.dto;

import fa.training.carrental.validations.UniqueEmail;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequestDto {
    @NotNull
    private String name;
    @NotNull(message = "Phone number is required")
    @Pattern(regexp = "^\\+\\d{11}$", message = "Phone must be a valid format")
    private String phoneNo;
    @NotNull
    private String role;
    @NotNull
    @Email(message = "Please enter a valid email address")
    @UniqueEmail
    private String email;
    @NotNull
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{7,}$", message = "Password must be at least 7 characters long and contain at least 1 letter and 1 number and special character")
    private String password;
}
