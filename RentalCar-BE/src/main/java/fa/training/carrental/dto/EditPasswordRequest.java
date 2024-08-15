package fa.training.carrental.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@NoArgsConstructor
@ToString
@AllArgsConstructor
@Builder
public class EditPasswordRequest {
    @Email(message = "Invalid email")
    @NotNull(message = "Email is required")
    private String email;

    @NotNull(message = "Password is required")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{7,}$", message = "Password must contain at least 7 characters, one uppercase, one lowercase, one number and one special character")
    private String oldPassword;

    @NotNull(message = "Password is required")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{7,}$", message = "Password must contain at least 7 characters, one uppercase, one lowercase, one number and one special character")
    private String password;
}
