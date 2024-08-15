package fa.training.carrental.dto;

import fa.training.carrental.enums.CarStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class CarUpdateDto {
    private Double mileage;
    private Double fuelConsumption;
    private BigDecimal basePrice;
    private BigDecimal deposit;
    private String address;
    private String description;
    private String additionalFunctions;
    private String termsOfUse;
    private CarStatus carStatus;
    private Integer cityProvinceId;
    private Integer districtId;
    private Integer wardId;
    private List<String> images;
}