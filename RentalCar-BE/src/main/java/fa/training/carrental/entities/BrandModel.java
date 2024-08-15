package fa.training.carrental.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
public class BrandModel {

    @Id
    private Long id;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String brand;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String model;

    @OneToMany(mappedBy = "brandModel")
    @JsonIgnore
    private List<Car> car;

}
