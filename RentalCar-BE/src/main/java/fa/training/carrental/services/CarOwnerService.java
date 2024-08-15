package fa.training.carrental.services;

import java.math.BigDecimal;
import java.util.List;

public interface CarOwnerService {
    BigDecimal calculateMonthlyIncome(Long carOwnerId, int month, int year);
    List<BigDecimal> listMonthlyIncome(Long carOwnerId, int year);
    List<BigDecimal> listYearlyIncome(Long carOwnerId);
}
