package fa.training.carrental.validations;

import fa.training.carrental.repositories.CarRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;

public class UniqueLicensePlateValidator implements ConstraintValidator<UniqueLicensePlate, String> {

    @Autowired
    private CarRepository carRepository;

    @Override
    public void initialize(UniqueLicensePlate constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(String licensePlate, ConstraintValidatorContext context) {
        if (licensePlate == null || licensePlate.isEmpty()) {
            return true; // Validation for @NotNull should handle this case
        }
        return !carRepository.existsByLicensePlate(licensePlate);
    }
}
