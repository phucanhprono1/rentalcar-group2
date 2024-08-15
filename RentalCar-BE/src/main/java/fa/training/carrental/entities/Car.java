package fa.training.carrental.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import fa.training.carrental.enums.CarStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Car extends AbstractAuditor{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "brand_model_id", referencedColumnName = "id")
    private BrandModel brandModel;
    private String name;
    @Column(name = "license_plate", unique = true)
    private String licensePlate;
    @ManyToOne
    @JoinColumn(name = "color_id", referencedColumnName = "id")
    private Color color;

    private Integer numberOfSeats;
    private Integer productionYears;
    private String transmissionType;
    private String fuelType;
    private Double mileage;
    private Double fuelConsumption;
    @Column(name = "base_price", columnDefinition = "MONEY")
    @Check(constraints = "base_price >= 0")
    private BigDecimal basePrice;
    @Column(name = "deposit", columnDefinition = "MONEY")
    @Check(constraints = "deposit >= 0")
    private BigDecimal deposit;
    @Nationalized
    private String address;
    private String description;
    private String additionalFunctions;
    private String termsOfUse;
    private String registrationPaper;
    private String certificateOfInspection;
    private String insurance;


    @ElementCollection
    private List<String> images;

    @ManyToOne
    @JoinColumn(name = "owner_id", referencedColumnName = "id")
    @JsonIgnore
    private CarOwner owner;

    @Enumerated(EnumType.ORDINAL)
    private CarStatus carStatus;
    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL)
    @JsonIgnore
    @JsonManagedReference
    private List<CarBooking> carBookings;

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