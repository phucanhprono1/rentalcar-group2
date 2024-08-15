package fa.training.carrental.repositories;

import fa.training.carrental.entities.BrandModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@RepositoryRestResource(collectionResourceRel = "brandModel", path = "brandModel")
public interface BrandModelRepository extends JpaRepository<BrandModel, Long> {

    @Query("select distinct b.brand from BrandModel b")
    List<String> getBrandList();

    @Query("select b.model from BrandModel b where b.brand = :brand")
    List<String> getModelList(@Param("brand") String brand);
    @Query("select b from BrandModel b where b.brand = :brand and b.model = :model")
    Optional<BrandModel> findByBrandAndModel(@Param("brand") String brand, @Param("model") String model);
}
