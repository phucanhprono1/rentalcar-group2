package fa.training.carrental.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class SearchCarDtoRequest {

    private String address;

    private LocalDate startDate;

    private LocalDate endDate;
}
