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
public class CityProvince {
    @Id
    private Integer cityCode;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String cityProvince;
    @OneToMany(mappedBy = "cityProvince")
    @JsonIgnore
    private List<District> districts;
}
