package fa.training.carrental.repositories;

import fa.training.carrental.entities.CarOwner;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
@RestResource(exported = false)
public interface CarOwnerRepository extends BaseRepository<CarOwner, Long>{
    Optional<CarOwner> findByEmail(String email);
    @Query("SELECT SUM(CASE WHEN b.bookingStatus = 5 THEN " +
            "c.basePrice * (DATEDIFF(day, b.startDateTime, b.endDateTime) + 1) " +
            "WHEN b.bookingStatus = 1 OR b.bookingStatus = 3 THEN 0 " +
            "ELSE c.deposit END) " +
            "FROM CarBooking cb " +
            "JOIN cb.car c " +
            "JOIN cb.booking b " +
            "WHERE c.owner.id = :ownerId " +
            "AND MONTH(b.lastModifiedDate) = :month " +
            "AND YEAR(b.lastModifiedDate) = :year")
    BigDecimal calculateMonthlyIncome(@Param("ownerId") Long ownerId, @Param("month") int month, @Param("year") int year);
    @Query("SELECT SUM(CASE WHEN b.bookingStatus = 5 THEN " +
            "c.basePrice * (DATEDIFF(day, b.startDateTime, b.endDateTime) + 1) " +
            "WHEN b.bookingStatus = 1 OR b.bookingStatus = 3 THEN 0 " +
            "ELSE c.deposit END) " +
            "FROM CarBooking cb " +
            "JOIN cb.car c " +
            "JOIN cb.booking b " +
            "WHERE c.owner.id = :ownerId " +
            "AND YEAR(b.startDateTime) = :year " +
            "GROUP BY MONTH(b.startDateTime)")
    List<BigDecimal> listMonthlyIncome(@Param("ownerId")Long carOwnerId, int year);
    @Query("SELECT SUM(CASE WHEN b.bookingStatus = 5 THEN " +
            "c.basePrice * (DATEDIFF(day, b.startDateTime, b.endDateTime) + 1) " +
            "WHEN b.bookingStatus = 1 OR b.bookingStatus = 3 THEN 0 " +
            "ELSE c.deposit END) " +
            "FROM CarBooking cb " +
            "JOIN cb.car c " +
            "JOIN cb.booking b " +
            "WHERE c.owner.id = :ownerId " +
            "AND YEAR(b.startDateTime) = :year " +
            "GROUP BY MONTH(b.startDateTime)")
    List<BigDecimal> listYearlyIncome(@Param("ownerId") Long ownerId);

}
