package fa.training.carrental.repositories;

import fa.training.carrental.entities.CityProvince;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.Optional;

@RepositoryRestResource(collectionResourceRel = "cityProvince", path = "cityProvince")
public interface CityProvinceRepository extends BaseRepository<CityProvince, Integer>{
}
