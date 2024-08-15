package fa.training.carrental.dto;

import fa.training.carrental.enums.TransactionType;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TransactionDTO {
    private Long id;
    private BigDecimal amount;
    private TransactionType type;
    private LocalDateTime dateTime;
    private String bookingNo;
    private String carName;
    private String note;

}
