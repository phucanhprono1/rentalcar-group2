package fa.training.carrental.entities;

import fa.training.carrental.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Check;

import java.math.BigDecimal;

@EqualsAndHashCode(callSuper = true)
@Entity
@Data
@Table(name = "tbl_transaction")
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class Transaction extends AbstractAuditor{
    @Id
    @GeneratedValue (strategy =  GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.ORDINAL)
    private TransactionType transactionType;
    @Column(columnDefinition = "MONEY")
    @Check(constraints = "amount <> 0")
    private BigDecimal amount;
    @Column(columnDefinition = "MONEY")
    private BigDecimal currentBalance;
    private String note;
    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name = "booking_id", referencedColumnName = "bookingNo")
    private Booking booking;
    @ManyToOne(cascade = CascadeType.REMOVE)
    @JoinColumn(name = "account_id", referencedColumnName = "id")
    private Account account;
}
