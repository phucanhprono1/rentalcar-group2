package fa.training.carrental.repositories;

import fa.training.carrental.entities.Driver;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RestResource;

@RestResource(exported = false)
public interface DriverRepository extends BaseRepository<Driver,Long>{

}
