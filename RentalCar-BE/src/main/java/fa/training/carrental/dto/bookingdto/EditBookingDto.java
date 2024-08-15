package fa.training.carrental.dto.bookingdto;

import fa.training.carrental.validations.ValidDriverDetails;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.SuperBuilder;

@EqualsAndHashCode(callSuper = true)
@Data
@SuperBuilder
@AllArgsConstructor
@ValidDriverDetails
public class EditBookingDto extends AbstractBooking{



}
