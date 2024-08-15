package fa.training.carrental.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CarHomePageDto {

    private Long sumOfCars;
    private Integer cityCode;
    private String cityName;
}
