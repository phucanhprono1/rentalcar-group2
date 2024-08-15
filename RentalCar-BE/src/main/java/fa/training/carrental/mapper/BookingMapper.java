package fa.training.carrental.mapper;

import fa.training.carrental.dto.bookingdto.BookingCarRequest;
import fa.training.carrental.dto.BookingCarResponse;
import fa.training.carrental.entities.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.springframework.stereotype.Component;

@Component
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface BookingMapper {
    @Mapping(target = "bookingNo", ignore = true)
    @Mapping(target = "carBookings", ignore = true)
    @Mapping(target = "bookingStatus", ignore = true)
    Booking toEntity(BookingCarRequest bookingCarRequest);

    BookingCarResponse toResponse(BookingCarRequest bookingCarRequest);

}
