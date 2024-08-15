package fa.training.carrental.dto;

import fa.training.carrental.enums.CarStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class CarDTO {
    private Long id;
    private String name;
    private String address;
    private CarStatus carStatus;
    private BigDecimal basePrice;
    private Double averageRatings;
    private Long bookingCount;

}