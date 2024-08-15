package fa.training.carrental.dto;

import fa.training.carrental.entities.*;
import fa.training.carrental.enums.CarStatus;
import fa.training.carrental.validations.UniqueLicensePlate;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarRequestDto {

    private Long id;

    @NotNull(message = "{ME003}")
    private String name;

    @NotNull(message = "{ME003}")
    @Pattern(regexp = "^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$", message = "{ME016}")
    @UniqueLicensePlate
    private String licensePlate;

    @NotNull(message = "{ME003}")
    private String brand;

    @NotNull(message = "{ME003}")
    private String model;

    @NotNull(message = "{ME003}")
    private String color;

    @NotNull(message = "{ME003}")
    private Integer numberOfSeats;

    @NotNull(message = "{ME003}")
    private Integer productionYears;

    @NotNull(message = "{ME003}")
    private String transmissionType;

    @NotNull(message = "{ME003}")
    private String fuelType;

    @NotNull(message = "{ME003}")
    private Double mileage;

    @NotNull(message = "{ME003}")
    private Double fuelConsumption;

    @NotNull(message = "{ME003}")
    private BigDecimal basePrice;

    @NotNull(message = "{ME003}")
    private BigDecimal deposit;

    @NotNull(message = "{ME003}")
    private String address;

    @NotNull(message = "{ME003}")
    private String description;

    @NotNull(message = "{ME003}")
    private String additionalFunctions;

    @NotNull(message = "{ME003}")
    private String termsOfUse;

    @NotNull(message = "{ME003}")
    private String registrationPaper;

    @NotNull(message = "{ME003}")
    private String certificateOfInspection;

    @NotNull(message = "{ME003}")
    private String insurance;

    @NotNull(message = "{ME003}")
    private List<String> images = new ArrayList<>();

    private CarOwner owner;

    @NotNull(message = "{ME003}")
    private CarStatus carStatus;

    @NotNull(message = "{ME003}")
    private Integer cityProvince;

    @NotNull(message = "{ME003}")
    private Integer district;

    @NotNull(message = "{ME003}")
    private Integer ward;
}
