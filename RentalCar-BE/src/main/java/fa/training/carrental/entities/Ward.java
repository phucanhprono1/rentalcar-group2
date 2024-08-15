package fa.training.carrental.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ward {
    @Id
    private Integer wardCode;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String ward;
    @ManyToOne
    @JoinColumn(name = "district_code", referencedColumnName = "districtCode")
    private District district;
}
