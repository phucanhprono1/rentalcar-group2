package fa.training.carrental.repositories;

import fa.training.carrental.entities.District;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(collectionResourceRel = "district", path = "district")
public interface DistrictRepository extends BaseRepository<District, Integer>{
    List<District> findDistrictByCityProvince_CityCode(@Param("cityProvinceCode")Integer cityProvinceCode);
}
