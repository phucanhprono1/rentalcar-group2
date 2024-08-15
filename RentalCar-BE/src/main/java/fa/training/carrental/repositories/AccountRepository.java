package fa.training.carrental.repositories;

import fa.training.carrental.entities.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RestResource(exported = false)
public interface AccountRepository extends BaseRepository<Account,Long> {
    Optional<Account> findByEmail(String email);
}
