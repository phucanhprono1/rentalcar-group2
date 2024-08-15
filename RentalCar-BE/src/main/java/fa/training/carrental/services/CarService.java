package fa.training.carrental.services;

import fa.training.carrental.dto.*;
import fa.training.carrental.entities.Car;
import fa.training.carrental.enums.CarStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CarService {

    Car save(Car car);

    Page<MyCarDto> findByOwner(Long ownerId, Pageable pageable);

    Car updateCarStatus(Long id, CarStatus status);


    Page<SearchCarDtoResponse> findAvailableCarsWithRatingsAndBookings(LocalDateTime startDateTime,
                                                                       LocalDateTime endDateTime,
                                                                       String addressPattern,
                                                                       String sortBy,
                                                                       Pageable pageable);


    Optional<CarDetailResponseDto> findCarById(long id);

    List<String> getCarImages(Long carId);
    Car updateCar(Long id, CarUpdateDto carUpdateDto);
    boolean hasBookings(Long carId);
    boolean existsByLicensePlate(String licensePlate);
    List<CarHomePageDto> sumOfCarByCity();

}
