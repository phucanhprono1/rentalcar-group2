package fa.training.carrental.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@EqualsAndHashCode(callSuper = true)
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Driver extends AbstractAuditor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String name;
    private LocalDate dateOfBirth;
    @Column(nullable = false)
    private String nationalIdNo;
    @Column(nullable = false)
    private String phoneNo;
    @Column(nullable = false)
    private String email;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String address;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String drivingLicense;
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "city_code")
    @ToString.Exclude
    private CityProvince cityProvince;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "district_code")
    @ToString.Exclude
    private District district;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "ward_code")
    @ToString.Exclude
    private Ward ward;

}
