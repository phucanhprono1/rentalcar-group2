package fa.training.carrental.repositories;

import fa.training.carrental.entities.Color;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.Optional;

@RepositoryRestResource(collectionResourceRel = "color", path = "color")
public interface ColorRepository extends BaseRepository<Color,Long>{
    Optional<Color> findByColor(String color);
}
