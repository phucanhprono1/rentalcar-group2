package fa.training.carrental.repositories;

import fa.training.carrental.entities.CarBooking;
import fa.training.carrental.entities.CarBookingId;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CarBookingRepository extends BaseRepository<CarBooking, CarBookingId>{
    @Query("SELECT cb FROM CarBooking cb WHERE cb.car.id = :carId AND " +
            "(cb.booking.startDateTime < :endDateTime AND cb.booking.endDateTime > :startDateTime)")
    List<CarBooking> findConflictingBookings(@Param("carId") Long carId,
                                             @Param("startDateTime") LocalDateTime startDateTime,
                                             @Param("endDateTime") LocalDateTime endDateTime);
}
