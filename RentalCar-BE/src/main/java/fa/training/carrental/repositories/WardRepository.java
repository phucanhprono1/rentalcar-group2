package fa.training.carrental.repositories;

import fa.training.carrental.entities.Account;
import fa.training.carrental.entities.Ward;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;
import java.util.Optional;

@RepositoryRestResource(collectionResourceRel = "ward", path = "ward")
public interface WardRepository extends BaseRepository<Ward, Integer>{
    List<Ward> findWardByDistrict_DistrictCode(@Param("districtCode")Integer districtCode);

}
