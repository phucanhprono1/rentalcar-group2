package fa.training.carrental.services;

import fa.training.carrental.dto.*;
import fa.training.carrental.dto.bookingdto.BookingCarRequest;
import fa.training.carrental.dto.bookingdto.EditBookingDto;
import fa.training.carrental.entities.Booking;
import fa.training.carrental.entities.Driver;
import fa.training.carrental.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface BookingService extends BaseService<Booking, String>{
    Page<ListBookingDto> getBookingsByCustomerId(Long customerId, Pageable pageable);
    BookingCarResponse bookCar(BookingCarRequest bookingCarRequest, MultipartFile renterDriverLicense, MultipartFile renterDriverDriverLicense);
    BookingDetailsDto getBookingDetails(Long customerId,String bookingId);
    BookingCarResponse editBooking(EditBookingDto editBookingDto, String bookingId, MultipartFile renterDriverLicense, MultipartFile renterDriverDriverLicense);
    BookingCarResponse cancelBooking(String bookingId,String email);
    BookingCarResponse confirmPickUp(String bookingId, String email);
    void updateCarStatus();
    BookingCarResponse returnCar(String bookingId, String email);

    int updateBookingStatus(Long carId, BookingStatus currentStatus, BookingStatus targetStatus);
}
