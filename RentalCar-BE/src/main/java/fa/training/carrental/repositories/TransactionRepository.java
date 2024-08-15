package fa.training.carrental.repositories;

import fa.training.carrental.dto.TransactionDTO;
import fa.training.carrental.entities.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RestResource;

import java.time.LocalDateTime;

@RestResource(exported = false)
public interface TransactionRepository extends BaseRepository<Transaction, Long>{

    @Query("Select new fa.training.carrental.dto.TransactionDTO (t.id, t.amount, t.transactionType, t.createdDate,b.bookingNo,c.name,t.note) " +
            " from Transaction t " +
            "LEFT JOIN t.booking b " +
            "LEFt JOIN b.carBookings cb " +
            "LeFt JOIN cb.car c " +
            "INNER join t.account a" +
            " where t.createdDate>=:fromDate and t.createdDate<=:toDate " +
            "AND a.id=:id " +
            "ORDER BY t.createdDate DESC"
            )
    Page<TransactionDTO> getByAccountId(@Param("fromDate") LocalDateTime fromDate,
                                        @Param("toDate") LocalDateTime toDate,
                                        @Param("id") Long id,
                                        Pageable pageable);
}
