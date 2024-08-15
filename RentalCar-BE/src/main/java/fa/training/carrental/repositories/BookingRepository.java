package fa.training.carrental.repositories;

import fa.training.carrental.dto.BookingDetailsDto;
import fa.training.carrental.dto.ListBookingDto;
import fa.training.carrental.entities.Booking;
import fa.training.carrental.entities.Driver;
import fa.training.carrental.enums.BookingStatus;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RestResource;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@RestResource(exported = false)
public interface BookingRepository extends BaseRepository<Booking, String> {

    @Query("SELECT new fa.training.carrental.dto.ListBookingDto(b.bookingNo, b.startDateTime, b.endDateTime, c.id, c.name, c.basePrice, c.deposit, b.bookingStatus, b.lastModifiedDate, " +
            "c.basePrice * (DATEDIFF(day, b.startDateTime, b.endDateTime)+1) as total) " +
            "FROM Booking b " +
            "INNER JOIN CarBooking cb on b.bookingNo = cb.booking.bookingNo " +
            "LEFT JOIN Car c ON cb.car.id = c.id " +
            "WHERE b.customer.id = :customerId")
    Page<ListBookingDto> findByCustomerId(@Param("customerId") Long customerId, Pageable pageable);

    @Query("SELECT new fa.training.carrental.dto.BookingDetailsDto(b.bookingNo, b.startDateTime, b.endDateTime, c.id, c.name, c.basePrice, c.deposit, b.bookingStatus, c.basePrice * (DATEDIFF(day, b.startDateTime, b.endDateTime)+1), b.customer.id, b.driver.id, b.paymentMethod, " +
            "cu.name, cu.email, cu.nationalIdNo, cu.phoneNo, cu.dateOfBirth, cu.address, w.wardCode, di.districtCode, cp.cityCode, " +
            "d.name, d.email, d.nationalIdNo, d.phoneNo, d.dateOfBirth, d.address, d.drivingLicense, " +
            "CASE WHEN d IS NOT NULL THEN wd.wardCode ELSE NULL END, " +
            "CASE WHEN d IS NOT NULL THEN did.districtCode ELSE NULL END, " +
            "CASE WHEN d IS NOT NULL THEN cpd.cityCode ELSE NULL END,cu.drivingLicense) " +
            "FROM Booking b " +
            "INNER JOIN CarBooking cb on b.bookingNo = cb.booking.bookingNo " +
            "LEFT JOIN Car c ON cb.car.id = c.id " +
            "LEFT JOIN Driver d ON b.driver.id = d.id " +
            "LEFT JOIN Customer cu ON b.customer.id = cu.id " +
            "LEFT JOIN CityProvince cp ON cu.cityProvince.cityCode = cp.cityCode " +
            "LEFT JOIN District di ON cu.district.districtCode = di.districtCode " +
            "LEFT JOIN Ward w ON cu.ward.wardCode = w.wardCode " +
            "LEFT JOIN CityProvince cpd ON d.cityProvince.cityCode = cpd.cityCode " +
            "LEFT JOIN District did ON d.district.districtCode = did.districtCode " +
            "LEFT JOIN Ward wd ON d.ward.wardCode = wd.wardCode " +
            "WHERE b.customer.id = :customerId AND b.bookingNo = :bookingNo")
    BookingDetailsDto findByCustomerIdAndBookingNo(Long customerId, String bookingNo);

    List<Booking> findAllByStartDateTimeBefore(LocalDateTime startDateTime);

    @Transactional
    @Modifying
    @Query("update Booking b set b.bookingStatus = :targetStatus where b.bookingNo in " +
            "(select cb.booking.bookingNo from CarBooking cb where cb.car.id = :carId) " +
            "and b.bookingStatus = :currentStatus")
    int updateBookingStatus(@Param("carId") Long carId,
                             @Param("currentStatus") BookingStatus currentStatus,
                             @Param("targetStatus") BookingStatus targetStatus);

    @Query(value = "select DATEDIFF(day, b.start_date_time, b.end_date_time)\n" +
            "from car c\n" +
            "         inner join dbo.car_booking cb on c.id = cb.car_id\n" +
            "         inner join dbo.booking b on b.booking_no = cb.booking_id\n" +
            "where c.id = 1 and b.booking_status = 4", nativeQuery = true)
    List<Long> calculateRentingDays(Long id);
    @Query("select case when count(1) > 0 then 1 else 0 end " +
            "from Booking b inner join CarBooking cb " +
            "on b.bookingNo = cb.booking.bookingNo " +
            "where cb.car.id = :carId and b.bookingStatus = :bookingStatus")
    int isPending(@Param("carId") Long id, @Param("bookingStatus") BookingStatus bookingStatus);

}