package fa.training.carrental.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.hibernate.validator.constraints.Range;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Feedback extends AbstractAuditor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Range(min = 1, max = 5)
    private Integer ratings;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String content;
    private LocalDateTime dateTime;

    @OneToOne
    @JoinColumn(name = "booking_id")
    @JsonManagedReference
    private Booking booking;

    // Getters and setters
}