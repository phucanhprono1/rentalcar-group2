package fa.training.carrental.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;

import java.math.BigDecimal;
import java.time.LocalDate;

@MappedSuperclass
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@SuperBuilder
public abstract class AbstractUser extends AbstractAuditor {
    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String name;
    private LocalDate dateOfBirth;
    private String nationalIdNo;
    @Pattern(regexp = "^\\+\\d{11}$")
    private String phoneNo;
    @Column(unique = true, nullable = false)
    @Email
    private String email;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String address;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String drivingLicense;
    @Column(nullable = false, columnDefinition = "MONEY")
    private BigDecimal wallet;
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "city_code")
    private CityProvince cityProvince;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "district_code")
    private District district;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "ward_code")
    private Ward ward;
}
