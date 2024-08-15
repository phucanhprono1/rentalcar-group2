package fa.training.carrental.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import fa.training.carrental.enums.BookingStatus;
import fa.training.carrental.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;

@EqualsAndHashCode(callSuper = true)
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Booking extends AbstractAuditor{
    @Id
    @GeneratedValue(generator = "booking-no-generator")
    @GenericGenerator(name = "booking-no-generator", strategy = "fa.training.carrental.utils.BookingNoGenerator")
    private String bookingNo;

    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    @OneToOne
    @JoinColumn(name = "driver_id", referencedColumnName = "id")
    private Driver driver;
    @Enumerated(EnumType.ORDINAL)
    private PaymentMethod paymentMethod;
    @Enumerated(EnumType.ORDINAL)
    private BookingStatus bookingStatus;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    @JsonIgnore
    @JsonManagedReference
    private List<CarBooking> carBookings;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "customer_id")
    @JsonIgnore
    private Customer customer;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    @JsonManagedReference
    private Feedback feedback;

    // Getters and setters
}
