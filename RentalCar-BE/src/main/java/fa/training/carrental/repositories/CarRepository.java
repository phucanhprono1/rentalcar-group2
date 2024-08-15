package fa.training.carrental.repositories;

import fa.training.carrental.dto.CarDetailResponseDto;
import fa.training.carrental.dto.CarHomePageDto;
import fa.training.carrental.dto.MyCarDto;
import fa.training.carrental.dto.SearchCarDtoResponse;
import fa.training.carrental.entities.Car;
import fa.training.carrental.enums.CarStatus;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

import java.util.Optional;

public interface CarRepository extends BaseRepository<Car, Long> {

    @Query("select new fa.training.carrental.dto.MyCarDto(c.id, c.name, c.basePrice, c.address, c.carStatus, avg(f.ratings), count(cb.car.id), null, null) " +
            "from Car c " +
            "left join CarBooking cb on c.id = cb.car.id " +
            "left join Feedback f on f.booking.bookingNo = cb.booking.bookingNo " +
            "where c.owner.id = :ownerId " +
            "group by c.id, c.name, c.basePrice, c.address, c.carStatus, c.lastModifiedDate")
    Page<MyCarDto> findByOwnerId(@Param("ownerId") Long ownerId, Pageable pageable);

    @Modifying
    @Transactional
    @Query("update Car c set c.carStatus = :status where c.id = :id")
    void updateCarStatus(@Param("id") Long id, @Param("status") CarStatus status);

    @Query("SELECT new fa.training.carrental.dto.SearchCarDtoResponse(c.id, c.name, c.address, c.carStatus, c.basePrice, c.lastModifiedDate, COALESCE(AVG(f.ratings), 0.0), COALESCE(COUNT(b.bookingNo), 0L)) " +
            "FROM Car c " +
            "LEFT JOIN c.carBookings cb " +
            "LEFT JOIN cb.booking b " +
            "LEFT JOIN b.feedback f " +
            "WHERE c.carStatus = 0 AND " +
            "LOWER(FUNCTION('dbo.RemoveAccent', c.address)) LIKE LOWER(FUNCTION('dbo.RemoveAccent',CONCAT('%', :addressPattern, '%')))" +
            "AND NOT EXISTS (" +
            "SELECT 1 FROM CarBooking cb2 JOIN cb2.booking b2 " +
            "WHERE cb2.car.id = c.id AND (:startDate < b2.endDateTime AND :endDate > b2.startDateTime)) " +
            "GROUP BY c.id, c.name, c.address, c.carStatus, c.basePrice, c.lastModifiedDate " +
            "ORDER BY " +
            "CASE WHEN :sortBy = 'LAST_MODIFIED_DATE_ASC' THEN c.lastModifiedDate END ASC, " +
            "CASE WHEN :sortBy = 'BASE_PRICE_ASC' THEN c.basePrice END ASC, " +
            "CASE WHEN :sortBy = 'BASE_PRICE_DESC' THEN c.basePrice END DESC, " +
            "c.lastModifiedDate DESC")
    Page<SearchCarDtoResponse> findAvailableCarsWithRatingsAndBookings(
            @Param("startDate") LocalDateTime startDateTime,
            @Param("endDate") LocalDateTime endDateTime,
            @Param("addressPattern") String addressPattern,
            @Param("sortBy") String sortBy,
            Pageable pageable);


    @Query("select new fa.training.carrental.dto.CarDetailResponseDto(" +
            "c.id, c.brandModel.brand, c.brandModel.model, c.name, c.licensePlate, c.color.color, c.numberOfSeats, " +
            "c.productionYears, c.transmissionType, c.fuelType, c.mileage, c.fuelConsumption, c.basePrice, c.deposit, " +
            "c.address, c.description, c.additionalFunctions, c.termsOfUse, c.registrationPaper, " +
            "c.certificateOfInspection, c.insurance, c.carStatus, " +
            "c.cityProvince.cityCode, c.district.districtCode, c.ward.wardCode, avg(f.ratings), count(cb.car.id), null, null) " +
            "from Car c " +
            "left join CarBooking cb on c.id = cb.car.id " +
            "left join Feedback f on f.booking.bookingNo = cb.booking.bookingNo " +
            "where c.id = :carId " +
            "group by c.id, c.brandModel.brand, c.brandModel.model, c.name, c.licensePlate, c.color.color, " +
            "c.numberOfSeats, c.productionYears, c.transmissionType, c.fuelType, c.mileage, c.fuelConsumption, " +
            "c.basePrice, c.deposit, c.address, c.description, c.additionalFunctions, c.termsOfUse, " +
            "c.registrationPaper, c.certificateOfInspection, c.insurance, c.carStatus, "+
            "c.cityProvince.cityCode, c.ward.wardCode, c.district.districtCode "
    )
    Optional<CarDetailResponseDto> findCarById(@Param("carId") long carId);


    @Query("SELECT c.images FROM Car c WHERE c.id = :carId")
    List<String> getImageByCarId(@Param("carId") Long carId);

    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END " +
            "FROM car c " +
            "INNER JOIN car_booking cb ON c.id = cb.car_id " +
            "INNER JOIN booking b ON cb.booking_id = b.booking_no " +
            "WHERE c.id = :carId " +
            "AND GETDATE() BETWEEN b.start_date_time AND b.end_date_time",
            nativeQuery = true)
    Integer existsByCarId(@Param("carId") Long carId);

    boolean existsByLicensePlate(String licensePlate);

    @Query("SELECT new fa.training.carrental.dto.CarHomePageDto(COUNT(c), c.cityProvince.cityCode, cp.cityProvince)" +
            "FROM Car c JOIN c.cityProvince cp " +
            "GROUP BY c.cityProvince.cityCode, cp.cityProvince " +
            "ORDER BY COUNT(c) DESC ")
    Page<CarHomePageDto> sumOfCarByCity(Pageable pageable);


}


