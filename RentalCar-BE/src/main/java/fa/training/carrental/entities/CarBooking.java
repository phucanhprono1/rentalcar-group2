package fa.training.carrental.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@EqualsAndHashCode(callSuper = true)
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class CarBooking extends AbstractAuditor{

    @EmbeddedId
    private CarBookingId id;

    @ManyToOne
    @MapsId("carId")
    @JoinColumn(name = "car_id")
    @JsonBackReference
    private Car car;

    @ManyToOne
    @MapsId("bookingId")
    @JoinColumn(name = "booking_id")
    @JsonBackReference
    private Booking booking;


    // Getters and setters
}
