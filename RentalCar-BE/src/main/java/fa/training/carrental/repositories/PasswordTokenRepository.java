package fa.training.carrental.repositories;

import fa.training.carrental.entities.PasswordResetToken;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    PasswordResetToken findByToken(String token);
    @Modifying
    @Transactional
    @Query("delete from PasswordResetToken p where p.account.id = ?1")
    void deleteByAccount(Long accountId);
}
