package fa.training.carrental.dto;

import fa.training.carrental.enums.CarStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@ToString
public class SearchCarDtoResponse {

    private Long id;
    private String name;
    private String address;
    private CarStatus carStatus;
    private BigDecimal basePrice;
    private LocalDateTime lastModifiedDate;
    private Double ratings;
    private Long noOfRide;
    private List<String> images;

    public SearchCarDtoResponse(Long id, String name, String address, CarStatus carStatus, BigDecimal basePrice, LocalDateTime lastModifiedDate, Double averageRating, Long bookingCount) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.carStatus = carStatus;
        this.basePrice = basePrice;
        this.lastModifiedDate = lastModifiedDate;
        this.ratings = averageRating;
        this.noOfRide = bookingCount;
    }
}
