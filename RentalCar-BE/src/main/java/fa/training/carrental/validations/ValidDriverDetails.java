package fa.training.carrental.validations;


import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Constraint(validatedBy = DriverDetailsValidator.class)
@Target({ ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidDriverDetails {
    String message() default "Driver details are required when hasDriver is true";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}