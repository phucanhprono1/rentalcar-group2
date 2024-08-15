package fa.training.carrental.repositories;

import fa.training.carrental.entities.Customer;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RestResource(exported = false)
public interface CustomerRepository extends BaseRepository<Customer, Long>{
    Optional<Customer> findByEmail(String email);
}
