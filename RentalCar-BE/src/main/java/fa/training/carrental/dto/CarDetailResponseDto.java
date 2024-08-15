package fa.training.carrental.dto;

import fa.training.carrental.enums.CarStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CarDetailResponseDto {

    private Long id;

    private String brand;

    private String model;;

    private String name;

    private String licensePlate;

    private String color;

    private Integer numberOfSeats;

    private Integer productionYears;

    private String transmissionType;

    private String fuelType;

    private Double mileage;

    private Double fuelConsumption;

    private BigDecimal basePrice;

    private BigDecimal deposit;

    private String address;

    private String description;

    private String additionalFunctions;

    private String termsOfUse;

    private String registrationPaper;

    private String certificateOfInspection;

    private String insurance;

    private CarStatus carStatus;

    private Integer cityCode;

    private Integer districtCode;

    private Integer wardCode;

    private Double rating;

    private Long numberOfRide;

    private Boolean isPendingDeposit;

    private Boolean isPendingPayment;
}
