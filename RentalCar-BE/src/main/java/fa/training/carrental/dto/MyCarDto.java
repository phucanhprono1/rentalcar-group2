package fa.training.carrental.dto;

import fa.training.carrental.enums.CarStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class MyCarDto {

    private Long id;

    private String name;

    private BigDecimal basePrice;

    private String address;

    private CarStatus carStatus;

    private Double rating;

    private Long numberOfRide;

    private Boolean isPendingDeposit;

    private Boolean isPendingPayment;
}
