package fa.training.carrental.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class District {
    @Id
    private Integer districtCode;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String district;
    @OneToMany(mappedBy = "district")
    @JsonIgnore
    private List<Ward> wards;
    @ManyToOne
    @JoinColumn(name = "city_code", referencedColumnName = "cityCode")
    private CityProvince cityProvince;
}
