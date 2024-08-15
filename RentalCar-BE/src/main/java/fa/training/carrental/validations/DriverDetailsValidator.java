package fa.training.carrental.validations;

import fa.training.carrental.dto.bookingdto.AbstractBooking;
import fa.training.carrental.dto.bookingdto.BookingCarRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class DriverDetailsValidator implements ConstraintValidator<ValidDriverDetails, AbstractBooking> {

    @Override
    public void initialize(ValidDriverDetails constraintAnnotation) {
    }

    @Override
    public boolean isValid(AbstractBooking bookingCarRequest, ConstraintValidatorContext context) {
        if (bookingCarRequest.getHasDriver() == null || !bookingCarRequest.getHasDriver()) {
            return true;
        }

        boolean isValid = bookingCarRequest.getCustomerDriverName() != null &&
                bookingCarRequest.getCustomerDriverEmail() != null &&
                bookingCarRequest.getCustomerDriverPhone() != null &&
                bookingCarRequest.getCustomerDriverAddress() != null &&
                bookingCarRequest.getCustomerDriverDateOfBirth() != null;

        if (!isValid) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Driver details are required when hasDriver is true")
                    .addConstraintViolation();
        }

        return isValid;
    }
}
